import React from 'react';
import {
  Mic,
  AudioLines,
  FolderOpen,
  History,
  Settings,
  HelpCircle,
  Home,
  ChevronRight
} from 'lucide-react';

export type PageId = 'landing' | 'studio' | 'voices' | 'projects' | 'history' | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenHelp: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onOpenHelp,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'studio' as PageId, label: 'Voice Studio', icon: Mic, badge: 'Flagship' },
    { id: 'voices' as PageId, label: 'Voice Atelier', icon: AudioLines },
    { id: 'projects' as PageId, label: 'My Projects', icon: FolderOpen },
    { id: 'history' as PageId, label: 'Audio History', icon: History },
    { id: 'settings' as PageId, label: 'Preferences', icon: Settings },
  ];

  const handleNav = (page: PageId) => {
    onNavigate(page);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-[#090A0C]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#101114] border-r border-[#302D27] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 flex items-center justify-between border-b border-[#302D27]">
            <button
              onClick={() => handleNav('landing')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-7 h-7 rounded-full border border-[#C8A96B]/50 flex items-center justify-center bg-[#17181C] group-hover:border-[#C8A96B] transition shadow-gold-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-semibold tracking-[0.2em] text-[#F5F1E8] group-hover:text-[#E4D1A1] transition leading-none">
                  VOXORA
                </span>
                <span className="text-[8px] uppercase tracking-[0.3em] text-[#C8A96B] font-medium mt-1">
                  STUDIO ATELIER
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNav('landing')}
              title="Return to Experience Overview"
              className="p-1.5 rounded-lg text-[#706E69] hover:text-[#E4D1A1] hover:bg-[#17181C] transition"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <div className="px-3 pt-3 pb-1.5 text-[9.5px] font-semibold tracking-[0.25em] uppercase text-[#706E69] font-mono">
              Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs tracking-wider transition ${
                    isActive
                      ? 'bg-[#17181C] text-[#E4D1A1] border border-[#C8A96B]/40 font-semibold shadow-gold-sm'
                      : 'text-[#A5A29B] hover:text-[#F5F1E8] hover:bg-[#141519] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#C8A96B]' : 'text-[#706E69]'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#C8A96B]/15 text-[#E4D1A1] border border-[#C8A96B]/30 uppercase tracking-widest">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Help & Guide */}
          <div className="p-4 pt-1">
            <button
              onClick={onOpenHelp}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-[#A5A29B] hover:text-[#F5F1E8] hover:bg-[#141519] transition"
            >
              <HelpCircle className="w-4 h-4 text-[#706E69]" />
              <span className="tracking-wide">Studio Nuance Guide</span>
            </button>
          </div>
        </div>

        {/* Bottom Section: Luxury Hardware Engine Status & Profile */}
        <div className="p-4 border-t border-[#302D27] space-y-3.5">
          {/* Acoustic Engine Status */}
          <div className="p-3.5 rounded-2xl bg-[#090A0C] border border-[#302D27]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#F5F1E8] mb-2">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] animate-pulse" />
                <span className="tracking-wide">Neural Engine</span>
              </span>
              <span className="text-[#C8A96B] text-[9.5px] uppercase font-mono font-bold tracking-widest">
                ACTIVE
              </span>
            </div>
            <div className="w-full bg-[#1D1E22] h-1 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#C8A96B] to-[#E4D1A1] h-full w-[35%]" />
            </div>
            <div className="flex justify-between items-center text-[9.5px] text-[#706E69] font-mono mt-2">
              <span>UNLIMITED FIDELITY</span>
              <span>48 KHZ MASTER</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#141519] transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C8A96B] to-[#E4D1A1] text-[#090A0C] font-bold text-xs flex items-center justify-center font-mono">
                AM
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-[#F5F1E8]">Alex Mercer</div>
                <div className="text-[10px] text-[#706E69] tracking-wider uppercase font-mono">
                  Private Edition
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#706E69]" />
          </div>
        </div>
      </aside>
    </>
  );
};
