import React from 'react';
import {
  Mic,
  AudioLines,
  FolderOpen,
  History,
  Settings,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Home
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
    { id: 'studio' as PageId, label: 'AI Voice Studio', icon: Mic, badge: 'Flagship' },
    { id: 'voices' as PageId, label: 'Voice Library', icon: AudioLines },
    { id: 'projects' as PageId, label: 'My Projects', icon: FolderOpen },
    { id: 'history' as PageId, label: 'Audio History', icon: History },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings },
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
          className="fixed inset-0 bg-navy-950/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-navy-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleNav('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-navy-900 dark:text-white flex items-center gap-1 font-['Plus_Jakarta_Sans']">
                  VOXORA
                  <span className="text-brand-600">.</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block -mt-1">
                  AI Voice Studio
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNav('landing')}
              title="Return to Landing Page"
              className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-700/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Support / Docs button */}
          <div className="p-3 pt-1">
            <button
              onClick={onOpenHelp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Voice Tips</span>
            </button>
          </div>
        </div>

        {/* Bottom Section: Storage Quota & User Badge */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Studio Engine Indicator */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-navy-900 dark:text-white mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Neural Studio Engine
              </span>
              <span className="text-brand-600 text-[10px] uppercase font-bold tracking-wider">Active</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-brand-600 to-indigo-600 h-full w-[24%]" />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Unlimited Neural Synthesis</span>
              <span>HD 48kHz</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                AM
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-navy-900 dark:text-white">Alex Mercer</div>
                <div className="text-[10px] text-slate-400">Creator Studio Plan</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
};

