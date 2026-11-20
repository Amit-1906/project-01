import React, { useState, useRef } from 'react';
import { Play, Pause, Star, ArrowUpRight, Sparkles } from 'lucide-react';
import { Voice } from '../types';

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
      // Fallback to browser speech synthesis
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
      className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 shadow-md ring-2 ring-brand-500/30'
          : 'bg-white dark:bg-navy-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-card'
      }`}
    >
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <div>
        {/* Top bar: Avatar + Badges + Favorite */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={voice.avatar}
                alt={voice.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
              <button
                onClick={handlePlayPreview}
                disabled={isLoading}
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm transition transform hover:scale-110 active:scale-95 ${
                  isPlaying ? 'bg-emerald-500' : 'bg-brand-600 hover:bg-brand-700'
                }`}
                title={isPlaying ? 'Pause preview' : 'Play voice preview'}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </button>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                  {voice.name}
                </h3>
                {voice.popular && (
                  <span className="p-0.5 text-amber-500" title="Popular choice">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {voice.language} &bull; {voice.accent}
              </div>
            </div>
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-lg transition ${
              voice.is_favorite
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
            title={voice.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${voice.is_favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
          {voice.description}
        </p>

        {/* Badges / Styles */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
            {voice.gender}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/40 dark:border-brand-800/40">
            {voice.category}
          </span>
          {voice.styles.slice(0, 2).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-md text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-400">
          {voice.locale}
        </span>
        <button
          onClick={() => onSelect(voice)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isSelected
              ? 'bg-brand-600 text-white'
              : 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/80'
          }`}
        >
          <span>{isSelected ? 'Active in Studio' : 'Select Voice'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

