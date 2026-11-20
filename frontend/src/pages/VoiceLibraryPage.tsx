import React, { useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, Star, Globe2, Mic2 } from 'lucide-react';
import { Voice } from '../types';
import { VoiceCard } from '../components/VoiceCard';

interface VoiceLibraryPageProps {
  voices: Voice[];
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
  onToggleFavorite: (voiceId: string) => void;
  onNavigateToStudio: () => void;
}

const CATEGORIES = [
  'All',
  'Professional',
  'Conversational',
  'Narration',
  'Storytelling',
  'News',
  'Educational',
  'Energetic',
  'Calm',
];

export const VoiceLibraryPage: React.FC<VoiceLibraryPageProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  onToggleFavorite,
  onNavigateToStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Female' | 'Male'>('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Extract unique languages & accents
  const languages = ['All', ...new Set(voices.map((v) => v.language.split(' ')[0]))];

  const filteredVoices = voices.filter((voice) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        voice.name.toLowerCase().includes(q) ||
        voice.description.toLowerCase().includes(q) ||
        voice.language.toLowerCase().includes(q) ||
        voice.accent.toLowerCase().includes(q) ||
        voice.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (activeCategory !== 'All') {
      if (
        voice.category.toLowerCase() !== activeCategory.toLowerCase() &&
        !voice.styles.some((s) => s.toLowerCase() === activeCategory.toLowerCase())
      ) {
        return false;
      }
    }

    // Gender
    if (genderFilter !== 'All' && voice.gender !== genderFilter) {
      return false;
    }

    // Language
    if (languageFilter !== 'All' && !voice.language.includes(languageFilter)) {
      return false;
    }

    // Favorites only
    if (onlyFavorites && !voice.is_favorite) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/50 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
            <Mic2 className="w-3.5 h-3.5" />
            <span>Neural Acoustic Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans'] tracking-tight">
            Voice Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Explore 50+ hyper-realistic AI voices trained on world-class voice actors. Listen to real samples, favorite your top picks, and load them directly into the Studio.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white dark:bg-navy-900 px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-right">
            <div className="text-xs font-bold text-navy-900 dark:text-white">{filteredVoices.length} Voices</div>
            <div className="text-[10px] text-slate-400">Available to Stream</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
        {/* Top search input & select dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by voice name, accent, language, style, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-medium w-full sm:w-auto">
            {(['All', 'Female', 'Male'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition ${
                  genderFilter === g
                    ? 'bg-white dark:bg-navy-700 font-bold text-brand-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Language dropdown */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 transition cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l === 'All' ? 'All Languages' : l}
              </option>
            ))}
          </select>

          {/* Favorites Filter button */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition ${
              onlyFavorites
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Voices Grid */}
      {filteredVoices.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            No voices found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, category pills, or clearing filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setGenderFilter('All');
              setLanguageFilter('All');
              setOnlyFavorites(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isSelected={selectedVoice.id === voice.id}
              onSelect={(v) => {
                onSelectVoice(v);
                onNavigateToStudio();
              }}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

