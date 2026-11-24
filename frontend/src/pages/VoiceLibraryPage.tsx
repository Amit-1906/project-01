import React, { useState } from 'react';
import { Search, Sparkles, Star, Mic2 } from 'lucide-react';
import type { Voice } from '../types';
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

  // Extract unique languages
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
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10 bg-[#090A0C]">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#302D27]/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17181C] border border-[#302D27] text-[#C8A96B] text-[10.5px] font-mono tracking-[0.25em] uppercase mb-4 shadow-gold-sm">
            <Mic2 className="w-3.5 h-3.5" />
            <span>NEURAL ACOUSTIC CATALOGUE</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#F5F1E8] tracking-tight">
            Voice Atelier
          </h1>
          <p className="text-sm text-[#A5A29B] font-light mt-2 max-w-xl leading-relaxed">
            Discover bespoke AI vocal instruments trained with world-class voice actors. Audition real acoustic samples, curate your favorites, and open them directly in the Studio.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-[#141519] px-5 py-3 rounded-2xl border border-[#302D27] shadow-luxury">
          <div className="text-right">
            <div className="font-mono text-sm font-bold text-[#E4D1A1]">{filteredVoices.length} Instruments</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#706E69]">Curated & Mastered</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#090A0C] border border-[#302D27] text-[#C8A96B] flex items-center justify-center">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-[#101114] border border-[#302D27] shadow-luxury space-y-5">
        {/* Search input & select dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#706E69]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by instrument name, accent, language, style, or diction..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm bg-[#17181C] border border-[#302D27] text-[#F5F1E8] placeholder:text-[#706E69] focus:outline-none focus:border-[#C8A96B] transition font-sans"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex rounded-2xl bg-[#090A0C] p-1 border border-[#302D27] text-xs font-mono w-full sm:w-auto">
            {(['All', 'Female', 'Male'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition ${
                  genderFilter === g
                    ? 'bg-[#C8A96B] font-bold text-[#090A0C] shadow-xs'
                    : 'text-[#A5A29B] hover:text-[#F5F1E8]'
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
            className="w-full sm:w-auto px-4 py-3 rounded-2xl text-xs sm:text-sm bg-[#17181C] border border-[#302D27] text-[#F5F1E8] focus:outline-none focus:border-[#C8A96B] transition cursor-pointer font-sans"
          >
            {languages.map((l) => (
              <option key={l} value={l} className="bg-[#17181C] text-[#F5F1E8]">
                {l === 'All' ? 'All Languages' : l}
              </option>
            ))}
          </select>

          {/* Favorites Filter button */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-mono uppercase tracking-wider border transition ${
              onlyFavorites
                ? 'bg-[#C8A96B]/20 border-[#C8A96B] text-[#E4D1A1]'
                : 'border-[#302D27] bg-[#17181C] text-[#A5A29B] hover:text-[#F5F1E8] hover:border-[#C8A96B]/50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-[#C8A96B]' : ''}`} />
            <span>Curated</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-2 border-t border-[#302D27]/80">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-[#C8A96B] text-[#090A0C] font-bold shadow-gold-sm'
                  : 'bg-[#141519] border border-[#302D27] text-[#A5A29B] hover:text-[#F5F1E8] hover:border-[#C8A96B]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Voices Grid */}
      {filteredVoices.length === 0 ? (
        <div className="p-20 rounded-3xl bg-[#101114] border border-[#302D27] text-center">
          <div className="w-12 h-12 rounded-full bg-[#17181C] border border-[#302D27] flex items-center justify-center text-[#706E69] mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-[#F5F1E8]">
            No Instruments Found
          </h3>
          <p className="text-xs text-[#A5A29B] font-light mt-1.5 max-w-sm mx-auto">
            Try adjusting your search criteria, category filters, or language selection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setGenderFilter('All');
              setLanguageFilter('All');
              setOnlyFavorites(false);
            }}
            className="mt-6 px-5 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase text-[#090A0C] bg-[#C8A96B] hover:bg-[#E4D1A1] transition font-bold"
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
