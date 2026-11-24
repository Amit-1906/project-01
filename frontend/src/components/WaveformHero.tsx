import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface SampleVoice {
  id: string;
  name: string;
  role: string;
  language: string;
  avatar: string;
  quote: string;
}

const SAMPLES: SampleVoice[] = [
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny',
    role: 'Editorial Narrator',
    language: 'English (US)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    quote: 'Welcome to Voxora. Transform written words into pristine, lifelike speech with timeless elegance.',
  },
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia',
    role: 'Broadsheet Atelier',
    language: 'English (UK)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    quote: 'Tonight’s retrospective reveals an unprecedented mastery of tone, cadence, and human vulnerability.',
  },
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher',
    role: 'Cinematic Monolith',
    language: 'English (US)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    quote: 'Deep within the archives of time, humanity has always sought the perfect vehicle for its grandest narratives.',
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria',
    role: 'Serene Sanctuary',
    language: 'English (US)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    quote: 'Breathe gently. Allow the weightless clarity of expression to settle into your consciousness.',
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

  // Luxury Gold Particle & Luminous Waves Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    // Generate gold dust particles
    const particleCount = 65;
    const particles: { x: number; y: number; size: number; alpha: number; speedX: number; speedY: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.25,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height * 0.48;

      // 1. Draw glowing gold particles
      particles.forEach((p) => {
        p.x += p.speedX * (isPlaying ? 1.5 : 1);
        p.y += p.speedY * (isPlaying ? 1.5 : 1);
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(228, 209, 161, ${p.alpha * (isPlaying ? 0.9 : 0.5)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering aura
        if (p.size > 1.2) {
          ctx.fillStyle = `rgba(200, 169, 107, ${p.alpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Draw multiple golden ethereal sine waveforms
      const waves = [
        { freq: 0.008, speed: 0.035, amp: isPlaying ? 38 : 12, alpha: 0.85, lineWidth: 1.8, color: '#E4D1A1' },
        { freq: 0.012, speed: -0.025, amp: isPlaying ? 26 : 8, alpha: 0.55, lineWidth: 1.2, color: '#C8A96B' },
        { freq: 0.006, speed: 0.02, amp: isPlaying ? 48 : 15, alpha: 0.35, lineWidth: 1.0, color: '#9E834D' },
        { freq: 0.016, speed: -0.04, amp: isPlaying ? 20 : 6, alpha: 0.25, lineWidth: 0.8, color: '#C8A96B' },
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.globalAlpha = w.alpha;
        ctx.lineWidth = w.lineWidth;
        ctx.shadowColor = '#C8A96B';
        ctx.shadowBlur = isPlaying ? 16 : 8;

        for (let x = 0; x < width; x += 3) {
          // Envelope function: taper at edges
          const envelope = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * w.freq + time * w.speed) * w.amp * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // 3. Tactile Gold Precision Bars at base
      const barCount = 52;
      const barWidth = width / barCount - 3;
      const baseBarY = height - 24;

      for (let i = 0; i < barCount; i++) {
        const factor = isPlaying ? 1.0 : 0.25;
        const wave = Math.sin((i * 0.25) + time * 0.08) * Math.cos(time * 0.04 - (i * 0.15));
        const barH = Math.max(3, (Math.abs(wave) * 22 + 4) * factor);
        const bx = i * (barWidth + 3);

        const grad = ctx.createLinearGradient(0, baseBarY - barH, 0, baseBarY);
        grad.addColorStop(0, '#E4D1A1');
        grad.addColorStop(1, 'rgba(200, 169, 107, 0.2)');

        ctx.fillStyle = grad;
        ctx.shadowBlur = 0;
        ctx.fillRect(bx, baseBarY - barH, barWidth, barH);
      }

      ctx.globalAlpha = 1.0;
      time += 1;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="relative max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#17181C]/90 to-[#101114]/95 border border-[#302D27] shadow-luxury backdrop-blur-2xl overflow-hidden">
      {/* Ambient Gold Backlight Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[280px] bg-[#C8A96B]/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-0 right-1/4 w-72 h-44 bg-[#E4D1A1]/5 blur-3xl pointer-events-none rounded-full" />

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#302D27]/60 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#C8A96B] animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A96B]">
            ACOUSTIC SCULPTURE 01 &bull; NEURAL HARMONICS
          </span>
        </div>

        <div className="text-[11px] tracking-[0.16em] uppercase text-[#A5A29B] font-mono">
          {isPlaying ? 'ACTIVE FREQUENCY &bull; 48 KHZ' : 'STANDBY &bull; AUDITION READY'}
        </div>
      </div>

      {/* Luminous Waveform & Particle Centerpiece */}
      <div className="relative w-full h-44 sm:h-52 mb-8 rounded-2xl bg-[#090A0C]/85 border border-[#302D27] p-2 flex items-center justify-center overflow-hidden shadow-inner-metal">
        <canvas
          ref={canvasRef}
          width={920}
          height={210}
          className="w-full h-full object-contain"
        />

        {/* Center Minimal Play Watermark */}
        <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.2em] text-[#706E69] font-mono">
          BANG & OLUFSEN AESTHETIC MASTER
        </div>
      </div>

      {/* Editorial Quote Exhibition */}
      <div className="p-6 rounded-2xl bg-[#141519]/90 border border-[#302D27] mb-8 relative z-10">
        <p className="font-serif text-xl sm:text-2xl text-[#F5F1E8] italic font-light leading-relaxed">
          "{selectedVoice.quote}"
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#302D27]/60 text-xs text-[#A5A29B]">
          <span className="font-sans tracking-wide">
            Voiced by <strong className="text-[#E4D1A1] font-semibold">{selectedVoice.name}</strong> &mdash; {selectedVoice.role} ({selectedVoice.language})
          </span>
          <span className="font-mono text-[#C8A96B] text-[11px] tracking-wider">
            HIGH-FIDELITY NEURAL
          </span>
        </div>
      </div>

      {/* Audition Voice Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
        {SAMPLES.map((voice) => {
          const isSelected = selectedVoice.id === voice.id;
          const isCurrentPlaying = isSelected && isPlaying;

          return (
            <button
              key={voice.id}
              onClick={() => handlePlaySample(voice)}
              disabled={isLoading}
              className={`group flex items-center gap-3.5 p-3.5 rounded-2xl text-left border transition-all duration-300 relative ${
                isSelected
                  ? 'border-[#C8A96B] bg-[#1D1E22] shadow-gold-sm ring-1 ring-[#C8A96B]/40'
                  : 'border-[#302D27] bg-[#141519]/80 hover:border-[#C8A96B]/50 hover:bg-[#17181C]'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={voice.avatar}
                  alt={voice.name}
                  className="w-11 h-11 rounded-xl object-cover border border-[#302D27] group-hover:border-[#C8A96B]/60 transition"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[#090A0C] transition transform group-hover:scale-110 ${
                    isCurrentPlaying
                      ? 'bg-[#E4D1A1]'
                      : 'bg-[#C8A96B]'
                  }`}
                >
                  {isCurrentPlaying ? (
                    <Pause className="w-2.5 h-2.5 fill-current" />
                  ) : (
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-wide text-[#F5F1E8] truncate">
                  {voice.name}
                </div>
                <div className="text-[10.5px] text-[#A5A29B] truncate font-light mt-0.5">
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
