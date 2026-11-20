import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Play,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Project } from '../types';
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
      onShowToast('success', 'Project Deleted', 'The project has been removed.');
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
      onShowToast('success', 'Project Renamed', `Updated to "${newTitle.trim()}".`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/50 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Project Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans'] tracking-tight">
            My Projects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, reopen, and export your voice studio productions.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/20 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Studio Project</span>
        </button>
      </div>

      {/* Toolbar: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or content..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 w-full sm:w-auto justify-end">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 transition cursor-pointer"
          >
            <option value="updated">Recently Modified</option>
            <option value="created">Date Created</option>
            <option value="title">Project Name</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-16 text-center text-xs font-medium text-slate-400">
          Loading studio projects...
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 mx-auto mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            No projects found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No projects match your current search query.'
              : 'Create your first voice studio project to begin synthesising scripts.'}
          </p>
          <button
            onClick={onNewProject}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((proj) => (
            <div
              key={proj.id}
              className="group p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card hover:border-brand-300 dark:hover:border-brand-700 transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-base text-navy-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition">
                    {proj.title}
                  </h3>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedProject(proj);
                        setNewTitle(proj.title);
                        setRenameModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Rename project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(proj.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Script snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {proj.script_text || <span className="italic text-slate-400">Empty script...</span>}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/40">
                    {proj.voice_name}
                  </span>
                  {proj.audio_duration && proj.audio_duration > 0 ? (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40">
                      {proj.audio_duration}s audio
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Not synthesized
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {proj.word_count} words
                  </span>
                </div>
              </div>

              {/* Bottom bar & Reopen action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Mod {formatDate(proj.updated_at)}</span>

                <div className="flex items-center space-x-2">
                  {proj.audio_url && (
                    <a
                      href={proj.audio_url}
                      download={`voxora_${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition"
                      title="Download generated audio"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => onOpenProject(proj)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 hover:bg-brand-100 dark:hover:bg-brand-900/80 transition"
                  >
                    <span>Open in Studio</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-in">
            <h3 className="font-bold text-lg text-navy-900 dark:text-white mb-2">
              Rename Project
            </h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                placeholder="New project title..."
                autoFocus
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-navy-900 dark:text-white mb-1">
              Delete Project?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
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

