import React, { useState, useEffect } from 'react';
import type { PageId } from './components/Sidebar';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import type { ToastMessage } from './components/Toast';
import { ToastContainer } from './components/Toast';
import { HelpModal } from './pages/HelpModal';
import { LandingPage } from './pages/LandingPage';
import { StudioPage } from './pages/StudioPage';
import { VoiceLibraryPage } from './pages/VoiceLibraryPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import type { Voice, Project } from './types';
import { api } from './services/api';
import { Menu } from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDark] = useState(true);

  // Initialize and load voices
  useEffect(() => {
    document.documentElement.classList.add('dark');
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const data = await api.getVoices();
      setVoices(data.voices);
      if (data.voices.length > 0 && !selectedVoice) {
        setSelectedVoice(data.voices[0]);
      }
    } catch {
      // Fallback voice if backend is connecting
      const fallback: Voice = {
        id: 'en-US-JennyNeural',
        name: 'Jenny',
        gender: 'Female',
        language: 'English (US)',
        locale: 'en-US',
        accent: 'American',
        category: 'Professional',
        styles: ['Professional', 'Conversational'],
        age: 'Young Adult',
        description: 'Warm, articulate, and crystal clear studio voice.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        color: 'from-amber-500 to-yellow-600',
        preview_text: 'Welcome to Voxora. Transform your script into pristine speech with timeless elegance.',
      };
      setVoices([fallback]);
      setSelectedVoice(fallback);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleFavorite = async (voiceId: string) => {
    try {
      const res = await api.toggleFavorite(voiceId);
      setVoices((prev) =>
        prev.map((v) => (v.id === voiceId ? { ...v, is_favorite: res.is_favorite } : v))
      );
      showToast(
        'info',
        res.is_favorite ? 'Added to Curated' : 'Removed from Curated',
        'Voice preference updated.'
      );
    } catch (err: any) {
      showToast('error', 'Curate Error', err.message);
    }
  };

  const handleNewProject = () => {
    setCurrentProject({
      id: '',
      title: 'New Studio Session',
      script_text: '',
      voice_id: selectedVoice?.id || 'en-US-JennyNeural',
      voice_name: selectedVoice?.name || 'Jenny',
      language: selectedVoice?.locale || 'en-US',
      accent: selectedVoice?.accent || 'American',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      stability: 0.75,
      char_count: 0,
      word_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setCurrentPage('studio');
    showToast('info', 'New Studio Session', 'Blank manuscript loaded in studio.');
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    const matchedVoice = voices.find((v) => v.id === project.voice_id);
    if (matchedVoice) {
      setSelectedVoice(matchedVoice);
    }
    setCurrentPage('studio');
    showToast('info', 'Session Opened', `Loaded "${project.title}".`);
  };

  const handleLoadScriptToStudio = (text: string, voiceId: string) => {
    setCurrentProject({
      id: '',
      title: 'Auditioned Manuscript',
      script_text: text,
      voice_id: voiceId,
      voice_name: 'Studio Voice',
      language: 'en-US',
      accent: 'American',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      stability: 0.75,
      char_count: text.length,
      word_count: text.split(/\s+/).length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const match = voices.find((v) => v.id === voiceId);
    if (match) setSelectedVoice(match);
    setCurrentPage('studio');
    showToast('info', 'Manuscript Loaded', 'Transferred text from history into Studio.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0C] text-[#F5F1E8] antialiased selection:bg-[#C8A96B]/25 selection:text-[#E4D1A1]">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* RENDER LANDING PAGE */}
      {currentPage === 'landing' ? (
        <div className="flex-1 flex flex-col">
          <Navbar
            onNavigate={setCurrentPage}
            isDark={isDark}
          />
          <main className="flex-1">
            <LandingPage
              onNavigate={setCurrentPage}
              onSelectVoice={(v) => setSelectedVoice(v)}
              featuredVoices={voices}
            />
          </main>
        </div>
      ) : (
        /* RENDER APP SHELL (Studio, Voices, Projects, History, Settings) */
        <div className="flex-1 flex">
          {/* Left Persistent Navigation Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onOpenHelp={() => setIsHelpOpen(true)}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#090A0C]">
            {/* Mobile Header Bar */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-[#101114] border-b border-[#302D27]">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-xl text-[#A5A29B] hover:bg-[#17181C]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
                <span className="font-serif text-xl font-semibold tracking-[0.2em] text-[#F5F1E8]">
                  VOXORA
                </span>
              </div>
              <button
                onClick={() => setCurrentPage('landing')}
                className="text-[10px] uppercase font-mono tracking-wider text-[#C8A96B] px-2.5 py-1 rounded-full bg-[#17181C] border border-[#302D27]"
              >
                Overview
              </button>
            </div>

            {/* Page Router */}
            <div className="flex-1">
              {currentPage === 'studio' && selectedVoice && (
                <StudioPage
                  currentProject={currentProject}
                  onProjectChange={(p) => setCurrentProject(p)}
                  selectedVoice={selectedVoice}
                  onSelectVoice={(v) => setSelectedVoice(v)}
                  voices={voices}
                  onShowToast={showToast}
                  onNavigateToVoices={() => setCurrentPage('voices')}
                />
              )}

              {currentPage === 'voices' && selectedVoice && (
                <VoiceLibraryPage
                  voices={voices}
                  selectedVoice={selectedVoice}
                  onSelectVoice={(v) => setSelectedVoice(v)}
                  onToggleFavorite={handleToggleFavorite}
                  onNavigateToStudio={() => setCurrentPage('studio')}
                />
              )}

              {currentPage === 'projects' && (
                <ProjectsPage
                  onOpenProject={handleOpenProject}
                  onNewProject={handleNewProject}
                  onShowToast={showToast}
                />
              )}

              {currentPage === 'history' && (
                <HistoryPage
                  onShowToast={showToast}
                  onLoadScriptToStudio={handleLoadScriptToStudio}
                />
              )}

              {currentPage === 'settings' && (
                <SettingsPage
                  voices={voices}
                  onShowToast={showToast}
                  isDark={isDark}
                  onToggleTheme={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
