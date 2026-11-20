import { Voice, Project, HistoryItem, UserSettings } from '../types';

const API_BASE = '/api';

export const api = {
  // Voices
  async getVoices(params?: {
    search?: string;
    language?: string;
    gender?: string;
    accent?: string;
    category?: string;
  }): Promise<{ voices: Voice[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.language) query.append('language', params.language);
    if (params?.gender) query.append('gender', params.gender);
    if (params?.accent) query.append('accent', params.accent);
    if (params?.category) query.append('category', params.category);

    const res = await fetch(`${API_BASE}/voices?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load voices');
    return res.json();
  },

  async toggleFavorite(voiceId: string): Promise<{ voice_id: string; is_favorite: boolean }> {
    const res = await fetch(`${API_BASE}/voices/${voiceId}/favorite`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return res.json();
  },

  // TTS Generation
  async generateSpeech(params: {
    text: string;
    voice_id: string;
    speed?: number;
    pitch?: number;
    volume?: number;
    stability?: number;
    format?: string;
    project_id?: string;
    project_title?: string;
  }): Promise<{
    success: boolean;
    history_id: string;
    audio_url: string;
    duration: number;
    file_size: number;
    engine: string;
    voice: Voice;
    char_count: number;
    word_count: number;
  }> {
    const res = await fetch(`${API_BASE}/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Generation failed' }));
      throw new Error(err.detail || 'Failed to generate speech');
    }
    return res.json();
  },

  async previewVoice(voiceId: string, text?: string): Promise<{
    success: boolean;
    audio_url: string;
    duration: number;
    voice: Voice;
  }> {
    const res = await fetch(`${API_BASE}/tts/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_id: voiceId, text }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Preview failed' }));
      throw new Error(err.detail || 'Failed to preview voice');
    }
    return res.json();
  },

  // Projects
  async getProjects(search?: string): Promise<{ projects: Project[]; total: number }> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/projects${query}`);
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  async getProject(id: string): Promise<{ project: Project }> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to load project');
    return res.json();
  },

  async createProject(data: Partial<Project>): Promise<{ success: boolean; project: Project }> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async updateProject(id: string, data: Partial<Project>): Promise<{ success: boolean; project: Project }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  async deleteProject(id: string): Promise<{ success: boolean; deleted_id: string }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return res.json();
  },

  // History
  async getHistory(search?: string): Promise<{ history: HistoryItem[]; total: number }> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/history${query}`);
    if (!res.ok) throw new Error('Failed to load history');
    return res.json();
  },

  async deleteHistoryItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete history item');
    return res.json();
  },

  async clearHistory(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear history');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ settings: UserSettings }> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(data: Partial<UserSettings>): Promise<{ success: boolean; settings: UserSettings }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // File Upload
  async uploadScript(file: File): Promise<{ filename: string; text: string; char_count: number; word_count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload-script`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Failed to upload script file');
    }
    return res.json();
  },
};

