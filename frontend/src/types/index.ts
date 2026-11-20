export interface Voice {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  language: string;
  locale: string;
  accent: string;
  category: string;
  styles: string[];
  age: string;
  description: string;
  avatar: string;
  color: string;
  preview_text: string;
  popular?: boolean;
  tags?: string[];
  is_favorite?: boolean;
}

export interface Project {
  id: string;
  title: string;
  script_text: string;
  voice_id: string;
  voice_name: string;
  language: string;
  accent: string;
  speed: number;
  pitch: number;
  volume: number;
  stability: number;
  audio_url?: string;
  audio_duration?: number;
  char_count: number;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface HistoryItem {
  id: string;
  project_id?: string;
  title: string;
  text_snippet: string;
  full_text?: string;
  voice_id: string;
  voice_name: string;
  language: string;
  engine: string;
  audio_url: string;
  duration: number;
  file_size: number;
  status: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_name: string;
  user_email: string;
  theme: 'light' | 'dark' | 'system';
  default_language: string;
  default_voice: string;
  default_speed: number;
  default_pitch: number;
  audio_format: 'mp3' | 'wav';
  engine_preference: 'neural' | 'openai' | 'elevenlabs' | 'browser';
  openai_api_key?: string;
  openai_api_key_masked?: string;
  elevenlabs_api_key?: string;
  elevenlabs_api_key_masked?: string;
  sample_rate: number;
  auto_normalize: number;
  enable_shortcuts: number;
}

