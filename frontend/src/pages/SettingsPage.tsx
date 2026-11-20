import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Sun,
  Moon,
  Volume2,
  Key,
  Shield,
  Save,
  CheckCircle2,
  Sparkles,
  Sliders,
  HardDrive
} from 'lucide-react';
import { UserSettings, Voice } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  voices: Voice[];
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  voices,
  onShowToast,
  isDark,
  onToggleTheme,
}) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [userName, setUserName] = useState('Alex Mercer');
  const [userEmail, setUserEmail] = useState('alex.mercer@voxora.studio');
  const [defaultLanguage, setDefaultLanguage] = useState('en-US');
  const [defaultVoice, setDefaultVoice] = useState('en-US-JennyNeural');
  const [defaultSpeed, setDefaultSpeed] = useState(1.0);
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav'>('mp3');
  const [enginePreference, setEnginePreference] = useState<'neural' | 'openai' | 'elevenlabs' | 'browser'>('neural');
  const [openaiKey, setOpenaiKey] = useState('');
  const [elevenlabsKey, setElevenlabsKey] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      if (data.settings) {
        setSettings(data.settings);
        setUserName(data.settings.user_name || 'Alex Mercer');
        setUserEmail(data.settings.user_email || 'alex.mercer@voxora.studio');
        setDefaultLanguage(data.settings.default_language || 'en-US');
        setDefaultVoice(data.settings.default_voice || 'en-US-JennyNeural');
        setDefaultSpeed(data.settings.default_speed || 1.0);
        setAudioFormat(data.settings.audio_format || 'mp3');
        setEnginePreference(data.settings.engine_preference || 'neural');
      }
    } catch (err: any) {
      onShowToast('error', 'Settings Load Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload: Partial<UserSettings> = {
        user_name: userName,
        user_email: userEmail,
        default_language: defaultLanguage,
        default_voice: defaultVoice,
        default_speed: defaultSpeed,
        audio_format: audioFormat,
        engine_preference: enginePreference,
      };

      if (openaiKey.trim()) payload.openai_api_key = openaiKey.trim();
      if (elevenlabsKey.trim()) payload.elevenlabs_api_key = elevenlabsKey.trim();

      const res = await api.updateSettings(payload);
      setSettings(res.settings);
      setOpenaiKey('');
      setElevenlabsKey('');
      onShowToast('success', 'Preferences Saved', 'Studio and engine configuration saved.');
    } catch (err: any) {
      onShowToast('error', 'Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/50 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Engine Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans'] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your default studio workflow, appearance, audio outputs, and provider API keys.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* USER PROFILE CARD */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>User Profile</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Pro Studio Plan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* APPEARANCE SETTINGS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-brand-600" />
              <span>Interface Appearance</span>
            </h3>
            <span className="text-xs text-slate-400">Default: Light Theme</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-navy-900 dark:text-white">Dark / Light Mode</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between high-contrast light studio palette and night dark mode.
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs font-semibold text-navy-900 dark:text-white hover:bg-slate-100 transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-brand-600" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>

        {/* STUDIO DEFAULT AUDIO PREFERENCES */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-600" />
              <span>Default Studio Parameters</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Default Voice
              </label>
              <select
                value={defaultVoice}
                onChange={(e) => setDefaultVoice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.language})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Default Speed ({defaultSpeed}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={defaultSpeed}
                onChange={(e) => setDefaultSpeed(parseFloat(e.target.value))}
                className="w-full mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Preferred Export Format
              </label>
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAudioFormat('mp3')}
                  className={`flex-1 py-1 rounded-lg transition ${
                    audioFormat === 'mp3'
                      ? 'bg-white dark:bg-navy-700 font-bold text-brand-600 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  MP3 (320kbps)
                </button>
                <button
                  type="button"
                  onClick={() => setAudioFormat('wav')}
                  className={`flex-1 py-1 rounded-lg transition ${
                    audioFormat === 'wav'
                      ? 'bg-white dark:bg-navy-700 font-bold text-brand-600 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  WAV (Lossless 48kHz)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI ENGINE & API KEYS CONFIGURATION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-600" />
              <span>AI Speech Engine & API Integration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              VOXORA features an independent multi-provider engine architecture. Enjoy built-in ultra-realistic Neural voices for free, or connect your personal OpenAI / ElevenLabs API keys.
            </p>
          </div>

          {/* Engine Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setEnginePreference('neural')}
              className={`p-3.5 rounded-2xl text-left border transition ${
                enginePreference === 'neural'
                  ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-navy-900 dark:text-white">Neural Studio</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Included Free</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                400+ Microsoft Azure neural broadcast voices. Ultra-realistic and completely free.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEnginePreference('openai')}
              className={`p-3.5 rounded-2xl text-left border transition ${
                enginePreference === 'openai'
                  ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-navy-900 dark:text-white">OpenAI TTS</span>
                <span className="text-[10px] font-bold text-slate-400">Bring Key</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Routes via OpenAI `tts-1` / `tts-1-hd` models (alloy, echo, nova, fable, onyx, shimmer).
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEnginePreference('elevenlabs')}
              className={`p-3.5 rounded-2xl text-left border transition ${
                enginePreference === 'elevenlabs'
                  ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-navy-900 dark:text-white">ElevenLabs</span>
                <span className="text-[10px] font-bold text-slate-400">Bring Key</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Routes via ElevenLabs multilingual v2 and Turbo synthesis pipeline.
              </p>
            </button>
          </div>

          {/* API Key Inputs */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  OpenAI API Key
                </label>
                {settings?.openai_api_key_masked && (
                  <span className="text-[10px] font-mono text-emerald-600">
                    Saved: {settings.openai_api_key_masked}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-••••••••••••••••••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm text-navy-900 dark:text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  ElevenLabs API Key
                </label>
                {settings?.elevenlabs_api_key_masked && (
                  <span className="text-[10px] font-mono text-emerald-600">
                    Saved: {settings.elevenlabs_api_key_masked}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
                placeholder="xi-••••••••••••••••••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm text-navy-900 dark:text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 transition disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving Changes...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

