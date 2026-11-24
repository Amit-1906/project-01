import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, ChevronDown } from 'lucide-react';
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

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#302D27',
      progressColor: '#C8A96B',
      cursorColor: '#E4D1A1',
      cursorWidth: 2,
      barWidth: 2.5,
      barGap: 3,
      barRadius: 2,
      height: 68,
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
    <div className="rounded-3xl border border-[#302D27] bg-gradient-to-b from-[#1D1E22] to-[#121316] shadow-luxury p-6 sm:p-7 transition-all relative overflow-hidden">
      {/* Subtle metallic hairline highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8A96B]/30 to-transparent" />

      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#302D27]/80">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-full bg-[#090A0C] border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B] shadow-inner-metal">
            <span className="w-2 h-2 rounded-full bg-[#C8A96B] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif text-lg font-medium text-[#F5F1E8]">
                Acoustic Master Playback
              </h4>
              <span className="text-[9.5px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 rounded-full bg-[#C8A96B]/15 text-[#E4D1A1] border border-[#C8A96B]/30">
                Studio Fidelity &bull; 48kHz
              </span>
            </div>
            <p className="text-xs text-[#A5A29B] font-light mt-0.5">
              Instrument: <span className="text-[#E4D1A1] font-medium">{voiceName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#A5A29B] hover:text-[#F5F1E8] bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/50 transition disabled:opacity-50"
              title="Regenerate speech with current cadence"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#C8A96B] ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="btn-gold px-4 py-2 rounded-xl text-xs font-bold tracking-wider inline-flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export {downloadFormat.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Bang & Olufsen Style Custom Waveform Surface */}
      <div className="relative py-4 px-3 rounded-2xl bg-[#090A0C]/90 border border-[#302D27] shadow-inner-metal">
        <div ref={containerRef} className="w-full cursor-pointer" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#090A0C]/80 backdrop-blur-xs">
            <div className="flex items-center space-x-2 text-xs font-mono tracking-wider text-[#C8A96B]">
              <span className="w-2 h-2 rounded-full bg-[#C8A96B] animate-ping" />
              <span>ALIGNING NEURAL HARMONICS...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hardware Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-2">
        {/* Play/Pause & Precise Time */}
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            disabled={!isReady}
            className="w-12 h-12 rounded-full bg-gradient-to-b from-[#E4D1A1] to-[#C8A96B] text-[#090A0C] flex items-center justify-center shadow-gold-sm hover:shadow-gold transition transform active:scale-95 disabled:opacity-50 group"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <div className="font-mono text-xs tracking-wider text-[#A5A29B] bg-[#141519] px-3.5 py-2 rounded-xl border border-[#302D27]">
            <span className="text-[#F5F1E8] font-bold">{formatTime(currentTime)}</span>
            <span className="mx-1.5 text-[#706E69]">/</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Speed, Volume, and Format Selectors */}
        <div className="flex items-center space-x-5">
          {/* Playback Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-[#A5A29B] hover:text-[#F5F1E8] bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/50 transition"
            >
              <span>{playbackRate.toFixed(2)}x</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#C8A96B]" />
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full mb-2 right-0 w-28 bg-[#17181C] border border-[#302D27] rounded-xl shadow-2xl py-1 z-30">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`w-full px-3 py-1.5 text-left text-xs font-mono ${
                      playbackRate === rate
                        ? 'font-bold text-[#E4D1A1] bg-[#C8A96B]/15'
                        : 'text-[#A5A29B] hover:text-[#F5F1E8] hover:bg-[#1D1E22]'
                    }`}
                  >
                    {rate.toFixed(2)}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={toggleMute}
              className="text-[#A5A29B] hover:text-[#C8A96B] transition"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-[#302D27] rounded-lg appearance-none cursor-pointer accent-[#C8A96B]"
            />
          </div>

          {/* Format Switcher */}
          <div className="flex rounded-xl bg-[#090A0C] p-1 border border-[#302D27] text-[11px] font-mono">
            <button
              onClick={() => setDownloadFormat('mp3')}
              className={`px-2.5 py-1 rounded-lg transition ${
                downloadFormat === 'mp3'
                  ? 'bg-[#C8A96B] text-[#090A0C] font-bold shadow-sm'
                  : 'text-[#A5A29B] hover:text-[#F5F1E8]'
              }`}
            >
              MP3
            </button>
            <button
              onClick={() => setDownloadFormat('wav')}
              className={`px-2.5 py-1 rounded-lg transition ${
                downloadFormat === 'wav'
                  ? 'bg-[#C8A96B] text-[#090A0C] font-bold shadow-sm'
                  : 'text-[#A5A29B] hover:text-[#F5F1E8]'
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
