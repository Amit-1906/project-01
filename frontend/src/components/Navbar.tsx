import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { PageId } from './Sidebar';

interface NavbarProps {
  onNavigate: (page: PageId) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#090A0C]/90 backdrop-blur-xl border-b border-[#302D27]/80 transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Minimal Luxury Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full border border-[#C8A96B]/50 flex items-center justify-center bg-[#17181C] group-hover:border-[#C8A96B] transition shadow-gold-sm">
            <span className="w-2 h-2 rounded-full bg-[#C8A96B] group-hover:scale-125 transition" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-semibold tracking-[0.22em] text-[#F5F1E8] group-hover:text-[#E4D1A1] transition leading-none">
              VOXORA
            </span>
            <span className="text-[8.5px] uppercase tracking-[0.35em] text-[#C8A96B] font-medium mt-1">
              HAUTE ACOUSTICS
            </span>
          </div>
        </button>

        {/* Center Editorial Links */}
        <nav className="hidden md:flex items-center space-x-10 text-[12px] font-medium tracking-[0.16em] uppercase text-[#A5A29B]">
          <a href="#experience" className="hover:text-[#E4D1A1] transition-colors">
            Experience
          </a>
          <button
            onClick={() => onNavigate('voices')}
            className="hover:text-[#E4D1A1] transition-colors uppercase tracking-[0.16em]"
          >
            Voice Atelier
          </button>
          <a href="#craft" className="hover:text-[#E4D1A1] transition-colors">
            The Craft
          </a>
          <a href="#curation" className="hover:text-[#E4D1A1] transition-colors">
            Editions
          </a>
        </nav>

        {/* Right Action: Gold Button */}
        <div className="flex items-center space-x-5">
          <button
            onClick={() => onNavigate('studio')}
            className="hidden sm:inline-block text-[11.5px] tracking-[0.18em] uppercase font-semibold text-[#A5A29B] hover:text-[#F5F1E8] transition"
          >
            Sign In
          </button>

          <button
            onClick={() => onNavigate('studio')}
            className="btn-gold px-5 sm:px-6 py-2.5 rounded-full text-[11px] font-bold tracking-[0.16em] inline-flex items-center gap-2 group"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
