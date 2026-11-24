import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Volume2,
  Key,
  Save
} from 'lucide-react';
import type { UserSettings, Voice } from '../types';
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
}) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
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
      onShowToast('success', 'Preferences Calibrated', 'Studio and diffusion engine parameters saved.');
    } catch (err: any) {
      onShowToast('error', 'Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10 bg-[#090A0C]">
      {/* Header */}
      <div className="pb-6 border-b border-[#302D27]/80">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17181C] border border-[#302D27] text-[#C8A96B] text-[10.5px] font-mono tracking-[0.25em] uppercase mb-4 shadow-gold-sm">
          <Settings className="w-3.5 h-3.5" />
          <span>SYSTEM & ENGINE CALIBRATION</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#F5F1E8] tracking-tight">
          Preferences
        </h1>
        <p className="text-sm text-[#A5A29B] font-light mt-2">
          Calibrate default studio acoustics, identity, export containers, and external engine API keys.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* USER PROFILE CARD */}
        <div className="p-7 sm:p-8 rounded-3xl bg-[#101114] border border-[#302D27] shadow-luxury space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#302D27]/80">
            <h3 className="font-serif text-2xl font-normal text-[#F5F1E8] flex items-center gap-2.5">
              <User className="w-4 h-4 text-[#C8A96B]" />
              <span>Studio Membership</span>
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full bg-[#C8A96B]/15 text-[#E4D1A1] border border-[#C8A96B]/30">
              Private Atelier Edition
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A5A29B] mb-2">
                Curator Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#302D27] bg-[#17181C] text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C8A96B] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A5A29B] mb-2">
                Registered Contact
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#302D27] bg-[#17181C] text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C8A96B] font-sans"
              />
            </div>
          </div>
        </div>

        {/* DEFAULT ACOUSTIC PARAMETERS */}
        <div className="p-7 sm:p-8 rounded-3xl bg-[#101114] border border-[#302D27] shadow-luxury space-y-6">
          <div className="pb-4 border-b border-[#302D27]/80">
            <h3 className="font-serif text-2xl font-normal text-[#F5F1E8] flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-[#C8A96B]" />
              <span>Default Studio Calibration</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A5A29B] mb-2">
                Default Instrument
              </label>
              <select
                value={defaultVoice}
                onChange={(e) => setDefaultVoice(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#302D27] bg-[#17181C] text-xs sm:text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C8A96B] cursor-pointer font-sans"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#17181C]">
                    {v.name} ({v.language})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A5A29B] mb-2">
                Default Velocity ({defaultSpeed.toFixed(2)}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={defaultSpeed}
                onChange={(e) => setDefaultSpeed(parseFloat(e.target.value))}
                className="w-full mt-3 h-1.5 bg-[#302D27] rounded-lg appearance-none cursor-pointer accent-[#C8A96B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A5A29B] mb-2">
                Default Export Format
              </label>
              <div className="flex rounded-2xl bg-[#090A0C] p-1 border border-[#302D27] text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAudioFormat('mp3')}
                  className={`flex-1 py-1.5 rounded-xl transition ${
                    audioFormat === 'mp3'
                      ? 'bg-[#C8A96B] font-bold text-[#090A0C] shadow-xs'
                      : 'text-[#A5A29B]'
                  }`}
                >
                  MP3 (320kbps)
                </button>
                <button
                  type="button"
                  onClick={() => setAudioFormat('wav')}
                  className={`flex-1 py-1.5 rounded-xl transition ${
                    audioFormat === 'wav'
                      ? 'bg-[#C8A96B] font-bold text-[#090A0C] shadow-xs'
                      : 'text-[#A5A29B]'
                  }`}
                >
                  WAV (48kHz)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI ENGINE & API INTEGRATION */}
        <div className="p-7 sm:p-8 rounded-3xl bg-[#101114] border border-[#302D27] shadow-luxury space-y-6">
          <div className="pb-4 border-b border-[#302D27]/80">
            <h3 className="font-serif text-2xl font-normal text-[#F5F1E8] flex items-center gap-2.5">
              <Key className="w-4 h-4 text-[#C8A96B]" />
              <span>Multi-Provider Neural Engine</span>
            </h3>
            <p className="text-xs text-[#A5A29B] font-light mt-1">
              VOXORA functions independently with built-in high-fidelity neural voices, or you can supply private OpenAI and ElevenLabs keys.
            </p>
          </div>

          {/* Engine Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setEnginePreference('neural')}
              className={`p-4 rounded-2xl text-left border transition ${
                enginePreference === 'neural'
                  ? 'border-[#C8A96B] bg-[#17181C] shadow-gold-sm'
                  : 'border-[#302D27] bg-[#141519] hover:bg-[#17181C]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-lg font-normal text-[#F5F1E8]">Neural Studio</span>
                <span className="text-[9px] font-mono font-bold text-[#C8A96B] uppercase">Default</span>
              </div>
              <p className="text-[11px] text-[#A5A29B] font-light leading-normal">
                400+ Microsoft Azure neural broadcast voices. Ultra-realistic and completely free.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEnginePreference('openai')}
              className={`p-4 rounded-2xl text-left border transition ${
                enginePreference === 'openai'
                  ? 'border-[#C8A96B] bg-[#17181C] shadow-gold-sm'
                  : 'border-[#302D27] bg-[#141519] hover:bg-[#17181C]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-lg font-normal text-[#F5F1E8]">OpenAI TTS</span>
                <span className="text-[9px] font-mono text-[#706E69]">Private Key</span>
              </div>
              <p className="text-[11px] text-[#A5A29B] font-light leading-normal">
                Routes via OpenAI `tts-1` models (alloy, echo, nova, fable, onyx, shimmer).
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEnginePreference('elevenlabs')}
              className={`p-4 rounded-2xl text-left border transition ${
                enginePreference === 'elevenlabs'
                  ? 'border-[#C8A96B] bg-[#17181C] shadow-gold-sm'
                  : 'border-[#302D27] bg-[#141519] hover:bg-[#17181C]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-lg font-normal text-[#F5F1E8]">ElevenLabs</span>
                <span className="text-[9px] font-mono text-[#706E69]">Private Key</span>
              </div>
              <p className="text-[11px] text-[#A5A29B] font-light leading-normal">
                Routes via ElevenLabs multilingual v2 and turbo synthesis pipeline.
              </p>
            </button>
          </div>

          {/* Keys Inputs */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A5A29B]">
                  OpenAI API Key
                </label>
                {settings?.openai_api_key_masked && (
                  <span className="text-[10px] font-mono text-[#C8A96B]">
                    SAVED: {settings.openai_api_key_masked}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-••••••••••••••••••••••••"
                className="w-full p-3 rounded-2xl border border-[#302D27] bg-[#17181C] text-xs sm:text-sm text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C8A96B]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A5A29B]">
                  ElevenLabs API Key
                </label>
                {settings?.elevenlabs_api_key_masked && (
                  <span className="text-[10px] font-mono text-[#C8A96B]">
                    SAVED: {settings.elevenlabs_api_key_masked}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
                placeholder="xi-••••••••••••••••••••••••"
                className="w-full p-3 rounded-2xl border border-[#302D27] bg-[#17181C] text-xs sm:text-sm text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C8A96B]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-gold px-8 py-3.5 rounded-full text-xs font-bold tracking-[0.2em] inline-flex items-center gap-2.5 shadow-gold disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'SAVING...' : 'SAVE PREFERENCES'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
