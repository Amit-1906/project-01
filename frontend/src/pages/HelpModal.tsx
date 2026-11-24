import React from 'react';
import { X, Sparkles, Keyboard, Lightbulb, BookOpen } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090A0C]/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#101114] rounded-3xl p-8 sm:p-10 border border-[#302D27] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-xl text-[#706E69] hover:text-[#F5F1E8] hover:bg-[#17181C] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full border border-[#C8A96B]/50 flex items-center justify-center bg-[#17181C] shadow-gold-sm">
            <Sparkles className="w-4 h-4 text-[#C8A96B]" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-normal text-[#F5F1E8]">
              Studio Nuance & Acoustic Guide
            </h2>
            <p className="text-xs text-[#A5A29B] font-light mt-0.5">
              Refined techniques for crafting cinematic, ultra-expressive synthetic speech.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-[#A5A29B] font-light">
          {/* Punctuation Nuance */}
          <div className="p-5 rounded-2xl bg-[#090A0C] border border-[#302D27]">
            <h3 className="font-serif text-xl font-normal text-[#F5F1E8] flex items-center gap-2.5 mb-3">
              <Lightbulb className="w-4 h-4 text-[#C8A96B]" />
              <span>How Punctuation Shapes Neural Intonation</span>
            </h3>
            <ul className="space-y-2.5 leading-relaxed">
              <li>
                <strong className="text-[#F5F1E8] font-semibold">Commas (,)</strong>: Introduce deliberate 200ms natural breath suspensions between clauses without terminal pitch drop.
              </li>
              <li>
                <strong className="text-[#F5F1E8] font-semibold">Ellipses (...)</strong>: Create thoughtful hesitation, dramatic buildup, or cinematic suspense.
              </li>
              <li>
                <strong className="text-[#F5F1E8] font-semibold">Question marks (?)</strong>: Accurately lift terminal pitch at the conclusion of inquisitive sentences.
              </li>
              <li>
                <strong className="text-[#F5F1E8] font-semibold">Hyphens (-)</strong>: Connect multi-syllable luxury terms for clean phonetic articulation.
              </li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-5 rounded-2xl bg-[#090A0C] border border-[#302D27]">
            <h3 className="font-serif text-xl font-normal text-[#F5F1E8] flex items-center gap-2.5 mb-3">
              <Keyboard className="w-4 h-4 text-[#C8A96B]" />
              <span>Studio Keyboard Shortcuts</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141519] border border-[#302D27]">
                <span>Generate Speech</span>
                <kbd className="px-2 py-0.5 rounded bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">Ctrl + Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141519] border border-[#302D27]">
                <span>Preserve Session</span>
                <kbd className="px-2 py-0.5 rounded bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">Ctrl + S</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141519] border border-[#302D27]">
                <span>Play / Pause Master</span>
                <kbd className="px-2 py-0.5 rounded bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">Space</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141519] border border-[#302D27]">
                <span>Clear Manuscript</span>
                <kbd className="px-2 py-0.5 rounded bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">Ctrl + Shift + X</kbd>
              </div>
            </div>
          </div>

          {/* Master Audio Specs */}
          <div className="p-5 rounded-2xl bg-[#090A0C] border border-[#302D27]">
            <h3 className="font-serif text-xl font-normal text-[#F5F1E8] flex items-center gap-2.5 mb-2">
              <BookOpen className="w-4 h-4 text-[#C8A96B]" />
              <span>Acoustic Mastering Specifications</span>
            </h3>
            <p className="leading-relaxed">
              All audio synthesized through VOXORA is 100% royalty-free for perpetual commercial use across broadcast television, audiobooks, podcasts, luxury brand campaigns, and interactive media. MP3 masters are rendered at 320kbps CBR, while WAV masters deliver uncompressed 48,000Hz 24-bit audio.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-[#302D27]/80 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold tracking-[0.16em]"
          >
            Return to Studio
          </button>
        </div>
      </div>
    </div>
  );
};
