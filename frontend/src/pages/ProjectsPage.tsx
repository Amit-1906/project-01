import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  ArrowRight
} from 'lucide-react';
import type { Project } from '../types';
import { api } from '../services/api';

interface ProjectsPageProps {
  onOpenProject: (project: Project) => void;
  onNewProject: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onOpenProject,
  onNewProject,
  onShowToast,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  // Rename modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [searchQuery]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects(searchQuery);
      setProjects(data.projects);
    } catch (err: any) {
      onShowToast('error', 'Failed to load projects', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      onShowToast('success', 'Project Removed', 'Session deleted from archive.');
    } catch (err: any) {
      onShowToast('error', 'Delete Failed', err.message);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTitle.trim()) return;

    try {
      const res = await api.updateProject(selectedProject.id, { title: newTitle.trim() });
      setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? res.project : p)));
      setRenameModalOpen(false);
      setSelectedProject(null);
      onShowToast('success', 'Session Renamed', `Updated to "${newTitle.trim()}".`);
    } catch (err: any) {
      onShowToast('error', 'Rename Failed', err.message);
    }
  };

  // Sorting
  const sortedProjects = [...projects].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    if (sortBy === 'created') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return a.title.localeCompare(b.title);
  });

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10 bg-[#090A0C]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#302D27]/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17181C] border border-[#302D27] text-[#C8A96B] text-[10.5px] font-mono tracking-[0.25em] uppercase mb-4 shadow-gold-sm">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>SESSION ARCHIVE</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#F5F1E8] tracking-tight">
            My Projects
          </h1>
          <p className="text-sm text-[#A5A29B] font-light mt-2">
            Organize, reopen, and export your private vocal productions.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="btn-gold px-6 py-3.5 rounded-full text-xs font-bold tracking-[0.18em] uppercase inline-flex items-center gap-2.5 shadow-gold"
        >
          <Plus className="w-4 h-4" />
          <span>New Studio Session</span>
        </button>
      </div>

      {/* Toolbar: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#101114] border border-[#302D27] shadow-luxury">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#706E69]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions by title or content..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#17181C] border border-[#302D27] text-[#F5F1E8] placeholder:text-[#706E69] focus:outline-none focus:border-[#C8A96B] transition font-sans"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-[#A5A29B] w-full sm:w-auto justify-end">
          <span className="uppercase text-[10.5px] tracking-wider text-[#706E69]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-[#17181C] border border-[#302D27] text-[#F5F1E8] focus:outline-none focus:border-[#C8A96B] transition cursor-pointer font-sans"
          >
            <option value="updated" className="bg-[#17181C]">Recently Modified</option>
            <option value="created" className="bg-[#17181C]">Date Created</option>
            <option value="title" className="bg-[#17181C]">Session Title</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-20 text-center text-xs font-mono tracking-wider text-[#706E69]">
          SYNCHRONIZING ATELIER ARCHIVE...
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="p-20 rounded-3xl bg-[#101114] border border-[#302D27] text-center">
          <div className="w-12 h-12 rounded-full bg-[#17181C] border border-[#302D27] flex items-center justify-center text-[#C8A96B] mx-auto mb-4">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-[#F5F1E8]">
            No Projects Found
          </h3>
          <p className="text-xs text-[#A5A29B] font-light mt-1.5 max-w-sm mx-auto">
            {searchQuery
              ? 'No projects match your current search query.'
              : 'Create your first voice studio session to begin composing.'}
          </p>
          <button
            onClick={onNewProject}
            className="mt-6 btn-gold px-6 py-3 rounded-full text-xs font-bold tracking-[0.16em]"
          >
            Create New Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((proj) => (
            <div
              key={proj.id}
              className="group p-6 rounded-3xl bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/60 transition-all duration-300 shadow-luxury flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-serif text-xl font-medium text-[#F5F1E8] line-clamp-1 group-hover:text-[#E4D1A1] transition">
                    {proj.title}
                  </h3>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedProject(proj);
                        setNewTitle(proj.title);
                        setRenameModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#706E69] hover:text-[#E4D1A1] hover:bg-[#1D1E22] transition"
                      title="Rename project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(proj.id)}
                      className="p-1.5 rounded-lg text-[#706E69] hover:text-rose-400 hover:bg-[#1D1E22] transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Script snippet */}
                <p className="text-xs text-[#A5A29B] line-clamp-3 mb-5 leading-relaxed font-light">
                  {proj.script_text || <span className="italic text-[#706E69]">Empty manuscript...</span>}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">
                    {proj.voice_name}
                  </span>
                  {proj.audio_duration && proj.audio_duration > 0 ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-[#C8A96B]/15 text-[#E4D1A1] border border-[#C8A96B]/30">
                      {proj.audio_duration}s master
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-[#17181C] text-[#706E69] border border-[#302D27]">
                      DRAFT
                    </span>
                  )}
                  <span className="text-[10.5px] font-mono text-[#706E69]">
                    {proj.word_count} words
                  </span>
                </div>
              </div>

              {/* Bottom bar & Reopen action */}
              <div className="pt-4 border-t border-[#302D27]/80 flex items-center justify-between text-xs text-[#706E69] font-mono">
                <span>Mod {formatDate(proj.updated_at)}</span>

                <div className="flex items-center space-x-2">
                  {proj.audio_url && (
                    <a
                      href={proj.audio_url}
                      download={`voxora_${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`}
                      className="p-2 rounded-xl text-[#A5A29B] hover:text-[#C8A96B] hover:bg-[#17181C] transition"
                      title="Download master audio"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => onOpenProject(proj)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#C8A96B] hover:text-[#E4D1A1] transition group-hover:translate-x-0.5"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENAME MODAL */}
      {renameModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090A0C]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#141519] rounded-3xl p-7 border border-[#302D27] shadow-2xl">
            <h3 className="font-serif text-2xl font-normal text-[#F5F1E8] mb-4">
              Rename Session
            </h3>
            <form onSubmit={handleRenameSubmit} className="space-y-5">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-[#302D27] bg-[#17181C] text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C8A96B] font-sans"
                placeholder="Session title..."
                autoFocus
              />
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#A5A29B] hover:text-[#F5F1E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase disabled:opacity-50"
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090A0C]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#141519] rounded-3xl p-7 border border-[#302D27] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-normal text-[#F5F1E8] mb-2">
              Delete Session?
            </h3>
            <p className="text-xs text-[#A5A29B] font-light mb-7">
              Are you sure you want to permanently remove this recording session from your archive?
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#A5A29B] hover:text-[#F5F1E8]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider font-bold text-white bg-rose-700 hover:bg-rose-600 transition"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
