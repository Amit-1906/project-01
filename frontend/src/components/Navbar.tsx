import React from 'react';
import { Sparkles, ArrowRight, Sun, Moon } from 'lucide-react';
import { PageId } from './Sidebar';

interface NavbarProps {
  onNavigate: (page: PageId) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, isDark = false, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-navy-950/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-navy-900 dark:text-white flex items-center gap-1 font-['Plus_Jakarta_Sans']">
              VOXORA
              <span className="text-brand-600">.</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block -mt-1">
              AI Voice Studio
            </span>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#how-it-works" className="hover:text-brand-600 dark:hover:text-white transition">
            How It Works
          </a>
          <button
            onClick={() => onNavigate('voices')}
            className="hover:text-brand-600 dark:hover:text-white transition"
          >
            Voice Library
          </button>
          <a href="#features" className="hover:text-brand-600 dark:hover:text-white transition">
            Features
          </a>
          <a href="#languages" className="hover:text-brand-600 dark:hover:text-white transition">
            Languages
          </a>
          <a href="#pricing" className="hover:text-brand-600 dark:hover:text-white transition">
            Pricing
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => onNavigate('studio')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/20 transition transform active:scale-95"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

