import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Sparkles, ChevronDown } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  voiceName?: string;
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  duration = 0,
  voiceName = 'Neural Voice',
  onRegenerate,
  isGenerating = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav'>('mp3');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    // Destroy existing wavesurfer instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#C4B5FD',
      progressColor: '#7C3AED',
      cursorColor: '#4C1D95',
      cursorWidth: 2,
      barWidth: 3,
      barGap: 3,
      barRadius: 3,
      height: 64,
      normalize: true,
      url: audioUrl,
    });

    ws.on('ready', () => {
      setIsReady(true);
      const wsDur = ws.getDuration();
      setTotalDuration(wsDur > 0 ? wsDur : duration);
    });

    ws.on('timeupdate', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    (ws as any).on('seeking', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVol);
    }
  };

  const toggleMute = () => {
    if (!wavesurferRef.current) return;
    if (isMuted) {
      wavesurferRef.current.setVolume(volume || 1);
      setIsMuted(false);
    } else {
      wavesurferRef.current.setVolume(0);
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(rate);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voxora_${voiceName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.${downloadFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-premium p-5 transition-all">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950/80 flex items-center justify-center text-brand-600">
            <Sparkles className="w-4 h-4 animate-pulse-subtle" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900 dark:text-white flex items-center gap-2">
              Generated Audio
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                Studio Master
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Voiced by <span className="font-medium text-brand-600 dark:text-brand-400">{voiceName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
              title="Regenerate speech with current settings"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {downloadFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Waveform Visualization Canvas Container */}
      <div className="relative py-2 px-1 rounded-xl bg-slate-50/70 dark:bg-navy-900/60 border border-slate-100 dark:border-slate-800">
        <div ref={containerRef} className="w-full cursor-pointer" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/60 dark:bg-navy-900/60 backdrop-blur-xs">
            <div className="flex items-center space-x-2 text-xs font-medium text-brand-600 dark:text-brand-400">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
              <span>Loading neural audio waveform...</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-2">
        {/* Play/Pause & Time */}
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            disabled={!isReady}
            className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <div className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
            <span className="text-navy-900 dark:text-white font-semibold">{formatTime(currentTime)}</span>
            <span className="mx-1 text-slate-400">/</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Speed, Volume, and Format */}
        <div className="flex items-center space-x-4">
          {/* Playback Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <span>{playbackRate}x</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full mb-1 right-0 w-24 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`w-full px-3 py-1 text-left text-xs ${
                      playbackRate === rate
                        ? 'font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-slate-500 hover:text-navy-900 dark:hover:text-white transition"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>

          {/* Format Picker */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-medium">
            <button
              onClick={() => setDownloadFormat('mp3')}
              className={`px-2 py-0.5 rounded-md transition ${
                downloadFormat === 'mp3'
                  ? 'bg-white dark:bg-navy-700 text-brand-600 dark:text-brand-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              MP3
            </button>
            <button
              onClick={() => setDownloadFormat('wav')}
              className={`px-2 py-0.5 rounded-md transition ${
                downloadFormat === 'wav'
                  ? 'bg-white dark:bg-navy-700 text-brand-600 dark:text-brand-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              WAV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
