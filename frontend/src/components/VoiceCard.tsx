import React, { useState, useRef } from 'react';
import { Play, Pause, Star, ArrowUpRight } from 'lucide-react';
import type { Voice } from '../types';

interface VoiceCardProps {
  voice: Voice;
  isSelected?: boolean;
  onSelect: (voice: Voice) => void;
  onToggleFavorite?: (voiceId: string) => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isSelected = false,
  onSelect,
  onToggleFavorite,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_id: voice.id, text: voice.preview_text }),
      });

      if (!res.ok) throw new Error('Preview failed');
      const data = await res.json();

      if (audioRef.current) {
        audioRef.current.src = data.audio_url;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(voice.preview_text);
        utter.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utter);
        setIsPlaying(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(voice.id);
  };

  return (
    <div
      onClick={() => onSelect(voice)}
      className={`group relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-[#1D1E22] border-[#C8A96B] shadow-gold-sm ring-1 ring-[#C8A96B]/50'
          : 'bg-[#141519] border-[#302D27] hover:border-[#C8A96B]/70 hover:bg-[#17181C] hover:shadow-luxury'
      }`}
    >
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <div>
        {/* Top Header: Avatar + Meta + Favorite */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={voice.avatar}
                alt={voice.name}
                className="w-13 h-13 rounded-2xl object-cover border border-[#302D27] group-hover:border-[#C8A96B]/60 transition shadow-inner-metal"
              />
              <button
                onClick={handlePlayPreview}
                disabled={isLoading}
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[#090A0C] transition transform group-hover:scale-110 active:scale-95 ${
                  isPlaying ? 'bg-[#E4D1A1]' : 'bg-[#C8A96B] hover:bg-[#E4D1A1]'
                }`}
                title={isPlaying ? 'Pause sample' : 'Play voice sample'}
              >
                {isPlaying ? (
                  <Pause className="w-2.5 h-2.5 fill-current" />
                ) : (
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                )}
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-semibold text-[#F5F1E8] group-hover:text-[#E4D1A1] transition">
                  {voice.name}
                </h3>
                {voice.popular && (
                  <span className="text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded bg-[#C8A96B]/20 text-[#E4D1A1] border border-[#C8A96B]/30 font-semibold font-mono">
                    SIGNATURE
                  </span>
                )}
              </div>
              <div className="text-[11.5px] text-[#A5A29B] font-light mt-0.5">
                {voice.language} &bull; {voice.accent}
              </div>
            </div>
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-xl transition ${
              voice.is_favorite
                ? 'text-[#C8A96B] bg-[#C8A96B]/15'
                : 'text-[#706E69] hover:text-[#C8A96B] hover:bg-[#1D1E22]'
            }`}
            title={voice.is_favorite ? 'Remove from curated' : 'Curate voice'}
          >
            <Star className={`w-4 h-4 ${voice.is_favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Editorial Description */}
        <p className="text-xs text-[#A5A29B] line-clamp-2 mb-4 leading-relaxed font-light">
          {voice.description}
        </p>

        {/* Luxury Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">
            {voice.category}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-[#090A0C] text-[#A5A29B] border border-[#302D27]">
            {voice.gender}
          </span>
          {voice.styles.slice(0, 1).map((s) => (
            <span
              key={s}
              className="px-2 py-1 rounded-lg text-[10px] font-mono text-[#706E69] bg-[#141519]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action */}
      <div className="pt-3.5 border-t border-[#302D27]/80 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-wider text-[#706E69]">
          {voice.locale}
        </span>

        <button
          onClick={() => onSelect(voice)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition ${
            isSelected
              ? 'bg-[#C8A96B] text-[#090A0C] font-bold'
              : 'text-[#C8A96B] hover:text-[#E4D1A1] group-hover:translate-x-0.5'
          }`}
        >
          <span>{isSelected ? 'Instrument Active' : 'Select Instrument'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
