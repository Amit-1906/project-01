import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  Search,
  Trash2,
  Play,
  Pause,
  Download,
  Calendar,
  Sparkles,
  Volume2,
  HardDrive,
  Clock,
  ArrowRight
} from 'lucide-react';
import { HistoryItem } from '../types';
import { api } from '../services/api';

interface HistoryPageProps {
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onLoadScriptToStudio: (text: string, voiceId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onShowToast,
  onLoadScriptToStudio,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [searchQuery]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory(searchQuery);
      setHistory(data.history);
    } catch (err: any) {
      onShowToast('error', 'History Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayToggle = (item: HistoryItem) => {
    if (!audioRef.current) return;

    if (activePlayingId === item.id) {
      audioRef.current.pause();
      setActivePlayingId(null);
      return;
    }

    audioRef.current.src = item.audio_url;
    audioRef.current.play();
    setActivePlayingId(item.id);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (activePlayingId === id && audioRef.current) {
        audioRef.current.pause();
        setActivePlayingId(null);
      }
      onShowToast('success', 'History Removed', 'Generation removed from history log.');
    } catch (err: any) {
      onShowToast('error', 'Delete Failed', err.message);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearHistory();
      setHistory([]);
      setClearConfirmOpen(false);
      if (audioRef.current) {
        audioRef.current.pause();
        setActivePlayingId(null);
      }
      onShowToast('success', 'History Cleared', 'All speech generation history has been deleted.');
    } catch (err: any) {
      onShowToast('error', 'Clear Failed', err.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <audio
        ref={audioRef}
        onEnded={() => setActivePlayingId(null)}
        onError={() => setActivePlayingId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/50 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
            <History className="w-3.5 h-3.5" />
            <span>Generation Log</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans'] tracking-tight">
            Audio History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, re-listen, and download all previous high-definition voice generations.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setClearConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search generations by title, snippet, or voice..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="text-xs font-medium text-slate-400">
          Showing <span className="text-navy-900 dark:text-white font-bold">{history.length}</span> generations
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="p-16 text-center text-xs font-medium text-slate-400">
          Loading generation history...
        </div>
      ) : history.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Volume2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            No audio history found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'No recordings matched your search.' : 'Synthesize speech in the Studio to build your production history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const isPlaying = activePlayingId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:border-brand-300 dark:hover:border-brand-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Play button + Title + Snippet */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => handlePlayToggle(item)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm transition transform active:scale-95 ${
                      isPlaying ? 'bg-emerald-500' : 'bg-brand-600 hover:bg-brand-700'
                    }`}
                    title={isPlaying ? 'Pause' : 'Play audio'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-navy-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {item.voice_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      "{item.text_snippet}"
                    </p>
                  </div>
                </div>

                {/* Right: Meta & Actions */}
                <div className="flex items-center space-x-4 self-end sm:self-center text-xs text-slate-400">
                  <div className="text-right">
                    <div className="font-mono font-semibold text-navy-900 dark:text-white">
                      {item.duration}s &bull; {formatFileSize(item.file_size)}
                    </div>
                    <div className="text-[11px] text-slate-400">{formatDate(item.created_at)}</div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <a
                      href={item.audio_url}
                      download={`voxora_${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`}
                      className="p-2 rounded-lg text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Download MP3"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onLoadScriptToStudio(item.full_text || item.text_snippet, item.voice_id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition"
                      title="Reopen text in Studio"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLEAR ALL CONFIRMATION MODAL */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-navy-900 dark:text-white mb-1">
              Clear All Audio History?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              This will permanently delete all records of previous speech generations.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

