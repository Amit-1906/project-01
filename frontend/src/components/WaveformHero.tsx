import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Sparkles, Volume2 } from 'lucide-react';

interface SampleVoice {
  id: string;
  name: string;
  role: string;
  language: string;
  avatar: string;
  quote: string;
  audioUrl?: string;
}

const SAMPLES: SampleVoice[] = [
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny',
    role: 'Studio Commercial',
    language: 'English (US)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    quote: 'Welcome to Voxora. Transform your written script into pristine, lifelike speech in seconds.',
  },
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia',
    role: 'BBC Broadcast Style',
    language: 'English (UK)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    quote: 'Good evening. Tonight\'s market retrospective highlights unprecedented resilience in green technology equities.',
  },
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher',
    role: 'Cinematic Narration',
    language: 'English (US)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    quote: 'Deep within the uncharted canyons of history, whispers of an ancient empire still echo through time.',
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria',
    role: 'Warm Meditation',
    language: 'English (US)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    quote: 'Breathe gently and allow the calm clarity of your thoughts to shape the path ahead.',
  },
];

export const WaveformHero: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState<SampleVoice>(SAMPLES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Play preview
  const handlePlaySample = async (voice: SampleVoice) => {
    setSelectedVoice(voice);

    if (audioRef.current) {
      if (isPlaying && selectedVoice.id === voice.id) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
      audioRef.current.pause();
    }

    try {
      setIsLoading(true);
      // Request preview from backend
      const res = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_id: voice.id, text: voice.quote }),
      });

      if (!res.ok) throw new Error('Preview error');
      const data = await res.json();

      if (audioRef.current) {
        audioRef.current.src = data.audio_url;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch {
      // Fallback to browser synthesis if backend preview fails
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(voice.quote);
        utter.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utter);
        setIsPlaying(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Canvas visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 48;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const factor = isPlaying ? 1.0 : 0.25;
        // Generate pseudo-natural wave shape
        const wave1 = Math.sin((i * 0.2) + phase);
        const wave2 = Math.cos((i * 0.35) - (phase * 0.8));
        const normalized = (wave1 + wave2 + 2) / 4; // 0 to 1
        const barHeight = Math.max(6, normalized * height * 0.8 * factor);

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        // Gradient from electric violet to vibrant sky blue
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#7C3AED');
        gradient.addColorStop(1, '#38BDF8');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      phase += isPlaying ? 0.08 : 0.015;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-navy-800/90 dark:to-navy-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-premium backdrop-blur-xl">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      {/* Top pill & live indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          <span>Interactive Neural Synthesis Demo</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-300 dark:bg-slate-600'}`} />
          <span>{isPlaying ? 'Streaming Neural Audio' : 'Ready to Preview'}</span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="relative w-full h-24 mb-6 rounded-2xl bg-slate-900/5 dark:bg-navy-950/60 p-2 flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-slate-800">
        <canvas
          ref={canvasRef}
          width={640}
          height={96}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Current Quote Display */}
      <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/70 dark:border-slate-800 mb-6 shadow-subtle">
        <p className="text-sm sm:text-base font-medium text-navy-900 dark:text-slate-100 italic">
          "{selectedVoice.quote}"
        </p>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>{selectedVoice.name} &bull; {selectedVoice.role} ({selectedVoice.language})</span>
          <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">48kHz &bull; 320kbps</span>
        </div>
      </div>

      {/* Voice Selection Chips with Immediate Play */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SAMPLES.map((voice) => {
          const isSelected = selectedVoice.id === voice.id;
          const isCurrentPlaying = isSelected && isPlaying;

          return (
            <button
              key={voice.id}
              onClick={() => handlePlaySample(voice)}
              disabled={isLoading}
              className={`flex items-center gap-3 p-2.5 rounded-xl text-left border transition transform active:scale-98 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 shadow-sm ring-1 ring-brand-500/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-navy-800/70 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={voice.avatar}
                  alt={voice.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                  isCurrentPlaying ? 'bg-emerald-500' : 'bg-brand-600'
                }`}>
                  {isCurrentPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs font-bold text-navy-900 dark:text-white truncate">
                  {voice.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {voice.role}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

