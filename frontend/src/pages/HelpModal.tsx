import React from 'react';
import { X, Sparkles, Keyboard, Lightbulb, BookOpen, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans']">
              VOXORA Studio Guide
            </h2>
            <p className="text-xs text-slate-400">
              Pro tips for crafting cinematic, ultra-expressive synthetic speech.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-600 dark:text-slate-300">
          {/* Punctuation Nuance */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
            <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-brand-600" />
              <span>How Punctuation Shapes Neural Intonation</span>
            </h3>
            <ul className="space-y-2 leading-relaxed">
              <li>
                <strong className="text-navy-900 dark:text-white">Commas (,)</strong>: Introduce brief, natural 200ms breath pauses between clauses without lowering tone.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white">Ellipses (...)</strong>: Create thoughtful hesitation, dramatic buildup, or cinematic suspense.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white">Question marks (?)</strong>: Accurately lift the terminal pitch at the end of inquisitive sentences.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white">Hyphens (-)</strong>: Connect multi-syllable tech terms or acronyms for clean phonetic articulation.
              </li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
            <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-brand-600" />
              <span>Keyboard Shortcuts</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-slate-700">
                <span>Generate Speech</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">Ctrl + Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-slate-700">
                <span>Save Project</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">Ctrl + S</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-slate-700">
                <span>Play / Pause</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">Space</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-slate-700">
                <span>Clear Script</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">Ctrl + Shift + X</kbd>
              </div>
            </div>
          </div>

          {/* Export & Quality Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
            <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span>Commercial Rights & Audio Specs</span>
            </h3>
            <p className="leading-relaxed">
              All audio files synthesized via VOXORA are 100% royalty-free for commercial use across YouTube, podcasts, audiobooks, broadcast television, and interactive applications. MP3 files are encoded at 320kbps CBR, while WAV files deliver uncompressed 48,000Hz 24-bit audio masters.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition"
          >
            Got It, Back to Studio
          </button>
        </div>
      </div>
    </div>
  );
};

