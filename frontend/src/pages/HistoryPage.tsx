import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  Search,
  Trash2,
  Play,
  Pause,
  Download,
  Volume2,
  ArrowRight
} from 'lucide-react';
import type { HistoryItem } from '../types';
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
      onShowToast('success', 'History Removed', 'Recording removed from history log.');
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
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10 bg-[#090A0C]">
      <audio
        ref={audioRef}
        onEnded={() => setActivePlayingId(null)}
        onError={() => setActivePlayingId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#302D27]/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17181C] border border-[#302D27] text-[#C8A96B] text-[10.5px] font-mono tracking-[0.25em] uppercase mb-4 shadow-gold-sm">
            <History className="w-3.5 h-3.5" />
            <span>CHRONOLOGY OF SYNTHESIS</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#F5F1E8] tracking-tight">
            Audio History
          </h1>
          <p className="text-sm text-[#A5A29B] font-light mt-2">
            Inspect, re-audition, and export all previous high-definition neural masterings.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setClearConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/60 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge History</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-5 rounded-3xl bg-[#101114] border border-[#302D27] shadow-luxury flex items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#706E69]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recordings by title, phrase, or instrument..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#17181C] border border-[#302D27] text-[#F5F1E8] placeholder:text-[#706E69] focus:outline-none focus:border-[#C8A96B] transition font-sans"
          />
        </div>

        <div className="text-xs font-mono text-[#706E69]">
          Showing <span className="text-[#F5F1E8] font-bold">{history.length}</span> recordings
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="p-20 text-center text-xs font-mono tracking-wider text-[#706E69]">
          RETRIEVING RECORDINGS...
        </div>
      ) : history.length === 0 ? (
        <div className="p-20 rounded-3xl bg-[#101114] border border-[#302D27] text-center">
          <div className="w-12 h-12 rounded-full bg-[#17181C] border border-[#302D27] flex items-center justify-center text-[#706E69] mx-auto mb-4">
            <Volume2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-[#F5F1E8]">
            No Recordings Found
          </h3>
          <p className="text-xs text-[#A5A29B] font-light mt-1.5 max-w-sm mx-auto">
            {searchQuery ? 'No recordings matched your search parameters.' : 'Synthesize speech in the Studio to build your private chronological log.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isPlaying = activePlayingId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/60 transition-all duration-300 shadow-luxury flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
              >
                {/* Left: Play button + Title + Snippet */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <button
                    onClick={() => handlePlayToggle(item)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-[#090A0C] flex-shrink-0 shadow-gold-sm transition transform group-hover:scale-105 active:scale-95 ${
                      isPlaying ? 'bg-[#E4D1A1]' : 'bg-[#C8A96B] hover:bg-[#E4D1A1]'
                    }`}
                    title={isPlaying ? 'Pause' : 'Audition recording'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h4 className="font-serif text-xl font-normal text-[#F5F1E8] group-hover:text-[#E4D1A1] transition truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">
                        {item.voice_name}
                      </span>
                      <span className="text-[10.5px] text-[#706E69] font-mono">
                        {item.language}
                      </span>
                    </div>
                    <p className="text-xs text-[#A5A29B] font-light truncate">
                      "{item.text_snippet}"
                    </p>
                  </div>
                </div>

                {/* Right: Meta & Actions */}
                <div className="flex items-center space-x-5 self-end sm:self-center text-xs font-mono text-[#706E69]">
                  <div className="text-right">
                    <div className="text-[#F5F1E8] font-bold">
                      {item.duration}s &bull; {formatFileSize(item.file_size)}
                    </div>
                    <div className="text-[10.5px] text-[#706E69] mt-0.5">{formatDate(item.created_at)}</div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <a
                      href={item.audio_url}
                      download={`voxora_${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`}
                      className="p-2.5 rounded-xl text-[#A5A29B] hover:text-[#C8A96B] hover:bg-[#17181C] transition"
                      title="Download MP3"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onLoadScriptToStudio(item.full_text || item.text_snippet, item.voice_id)}
                      className="p-2.5 rounded-xl text-[#A5A29B] hover:text-[#E4D1A1] hover:bg-[#17181C] transition"
                      title="Load text into Studio"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2.5 rounded-xl text-[#706E69] hover:text-rose-400 hover:bg-[#17181C] transition"
                      title="Delete recording"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090A0C]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#141519] rounded-3xl p-7 border border-[#302D27] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-normal text-[#F5F1E8] mb-2">
              Purge All History?
            </h3>
            <p className="text-xs text-[#A5A29B] font-light mb-7">
              This will permanently delete all records of previous neural speech masterings.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#A5A29B] hover:text-[#F5F1E8]"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider font-bold text-white bg-rose-700 hover:bg-rose-600 transition"
              >
                Purge Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
