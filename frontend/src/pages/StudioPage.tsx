import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  Trash2,
  Upload,
  FileText,
  Sliders,
  Volume2,
  RotateCcw,
  Play,
  Pause,
  ChevronDown,
  Info,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Zap,
  Globe2,
  ExternalLink
} from 'lucide-react';
import { Voice, Project, HistoryItem } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';
import { api } from '../services/api';

interface StudioPageProps {
  currentProject: Project | null;
  onProjectChange: (project: Project) => void;
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
  voices: Voice[];
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onNavigateToVoices: () => void;
}

const SAMPLE_SCRIPTS = [
  {
    label: 'Product Launch',
    text: 'Welcome to the next generation of conversational AI. Today, we are thrilled to unveil a breakthrough that redefines how machines understand human emotion, intonation, and creative context. Built with unparalleled precision, every nuance in voice inflection brings your stories vividly to life.',
  },
  {
    label: 'Mindfulness & Meditation',
    text: 'Take a deep breath in through your nose... hold it gently for a moment... and slowly exhale. Release any tension in your shoulders and allow your mind to settle into this peaceful, tranquil stillness. You are calm, centered, and fully present.',
  },
  {
    label: 'Tech Podcast Intro',
    text: 'Hello everyone and welcome back to ByteSize Future! Today we are diving into generative speech synthesis, neural vocoders, and what the future of synthetic media looks like in 2026. Grab your headphones and let us dive straight in.',
  },
  {
    label: 'Historical Documentary',
    text: 'Deep within the ancient mountains of Anatolia, early civilizations carved sanctuaries directly into living stone. As the winter sun set over the horizon, ceremonies echoed with prayers that would echo across millennia.',
  },
];

export const StudioPage: React.FC<StudioPageProps> = ({
  currentProject,
  onProjectChange,
  selectedVoice,
  onSelectVoice,
  voices,
  onShowToast,
  onNavigateToVoices,
}) => {
  // State for editor & project
  const [projectTitle, setProjectTitle] = useState(currentProject?.title || 'Untitled Studio Script');
  const [scriptText, setScriptText] = useState(
    currentProject?.script_text ||
      'Welcome to Voxora. Transform any text into expressive, natural-sounding speech with AI. Start typing or paste your script here.'
  );

  // Settings State
  const [speed, setSpeed] = useState(currentProject?.speed || 1.0);
  const [pitch, setPitch] = useState(currentProject?.pitch || 1.0);
  const [volume, setVolume] = useState(currentProject?.volume || 1.0);
  const [stability, setStability] = useState(currentProject?.stability || 0.75);
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav'>('mp3');

  // Filters for Voice Picker in Settings Panel
  const [genderFilter, setGenderFilter] = useState<'All' | 'Female' | 'Male'>('All');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

  // Generation & Audio State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(currentProject?.audio_url || null);
  const [audioDuration, setAudioDuration] = useState<number>(currentProject?.audio_duration || 0);

  // Voice Preview in Settings Panel
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Recent generations in right panel
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load history on mount
  useEffect(() => {
    loadRecentHistory();
  }, []);

  // Update when currentProject changes
  useEffect(() => {
    if (currentProject) {
      setProjectTitle(currentProject.title);
      setScriptText(currentProject.script_text);
      setSpeed(currentProject.speed);
      setPitch(currentProject.pitch);
      setVolume(currentProject.volume);
      setStability(currentProject.stability);
      if (currentProject.audio_url) {
        setGeneratedAudioUrl(currentProject.audio_url);
        setAudioDuration(currentProject.audio_duration || 0);
      }
      const matchVoice = voices.find((v) => v.id === currentProject.voice_id);
      if (matchVoice) onSelectVoice(matchVoice);
    }
  }, [currentProject?.id]);

  const loadRecentHistory = async () => {
    try {
      const data = await api.getHistory();
      setRecentHistory(data.history.slice(0, 5));
    } catch {
      // ignore
    }
  };

  // Text statistics
  const charCount = scriptText.length;
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const chunkCount = Math.max(1, Math.ceil(charCount / 500));

  // Voice filtering for selector
  const filteredVoices = voices.filter((v) => {
    if (genderFilter !== 'All' && v.gender !== genderFilter) return false;
    if (languageFilter !== 'All' && !v.language.includes(languageFilter)) return false;
    return true;
  });

  // Extract unique languages
  const availableLanguages = ['All', ...new Set(voices.map((v) => v.language.split(' ')[0]))];

  // Save Project
  const handleSaveProject = async () => {
    try {
      setIsSaving(true);
      if (currentProject?.id) {
        const res = await api.updateProject(currentProject.id, {
          title: projectTitle,
          script_text: scriptText,
          voice_id: selectedVoice.id,
          voice_name: selectedVoice.name,
          language: selectedVoice.locale,
          accent: selectedVoice.accent,
          speed,
          pitch,
          volume,
          stability,
          audio_url: generatedAudioUrl || undefined,
          audio_duration: audioDuration,
        });
        onProjectChange(res.project);
        onShowToast('success', 'Project Saved', `"${projectTitle}" updated successfully.`);
      } else {
        const res = await api.createProject({
          title: projectTitle,
          script_text: scriptText,
          voice_id: selectedVoice.id,
          voice_name: selectedVoice.name,
          language: selectedVoice.locale,
          accent: selectedVoice.accent,
          speed,
          pitch,
          volume,
          stability,
        });
        onProjectChange(res.project);
        onShowToast('success', 'Project Created', `"${projectTitle}" has been saved to your projects.`);
      }
    } catch (err: any) {
      onShowToast('error', 'Failed to Save', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate Speech
  const handleGenerateSpeech = async () => {
    if (!scriptText.trim()) {
      onShowToast('error', 'Empty Script', 'Please enter some text before generating speech.');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.generateSpeech({
        text: scriptText,
        voice_id: selectedVoice.id,
        speed,
        pitch,
        volume,
        stability,
        format: audioFormat,
        project_id: currentProject?.id,
        project_title: projectTitle,
      });

      setGeneratedAudioUrl(res.audio_url);
      setAudioDuration(res.duration);
      loadRecentHistory();

      onShowToast(
        'success',
        'Speech Generated!',
        `Generated ${res.duration}s audio (${res.word_count} words) with ${selectedVoice.name}.`
      );
    } catch (err: any) {
      onShowToast('error', 'Speech Generation Failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview Voice in Settings Panel
  const handlePreviewVoice = async () => {
    if (previewAudioRef.current && isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
      return;
    }

    try {
      setIsPreviewLoading(true);
      const res = await api.previewVoice(selectedVoice.id, selectedVoice.preview_text);
      if (previewAudioRef.current) {
        previewAudioRef.current.src = res.audio_url;
        await previewAudioRef.current.play();
        setIsPreviewPlaying(true);
      }
    } catch {
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(selectedVoice.preview_text);
        utter.onend = () => setIsPreviewPlaying(false);
        window.speechSynthesis.speak(utter);
        setIsPreviewPlaying(true);
      }
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Import TXT File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await api.uploadScript(file);
      setScriptText(data.text);
      if (projectTitle === 'Untitled Studio Script') {
        setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      onShowToast('success', 'Script Imported', `Loaded ${data.word_count} words from ${file.name}`);
    } catch (err: any) {
      onShowToast('error', 'Import Failed', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-navy-950 flex flex-col">
      <audio
        ref={previewAudioRef}
        onEnded={() => setIsPreviewPlaying(false)}
        onError={() => setIsPreviewPlaying(false)}
      />

      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: Studio Title & Project Name input */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="font-bold text-base sm:text-lg text-navy-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-500 focus:outline-none transition py-0.5 px-1 -ml-1 rounded"
                  placeholder="Project Title..."
                />
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {currentProject?.id ? 'Saved in Cloud' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Voice Studio &bull; {selectedVoice.name} ({selectedVoice.language})
              </p>
            </div>
          </div>

          {/* Right: Actions (Save Project & Generate Speech) */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveProject}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs transition disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving...' : 'Save Project'}</span>
            </button>

            <button
              onClick={handleGenerateSpeech}
              disabled={isGenerating || !scriptText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 shadow-md shadow-brand-500/25 transition transform active:scale-95 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 fill-current ${isGenerating ? 'animate-bounce' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Speech'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* THREE-COLUMN WORKSPACE */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CENTER / MAIN SCRIPT EDITOR & AUDIO PLAYER (Col 1 to 8) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* SCRIPT EDITOR CARD */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle p-5 sm:p-6 flex flex-col flex-1">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              {/* Presets and Upload */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-1">Presets:</span>
                {SAMPLE_SCRIPTS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setScriptText(preset.text);
                      onShowToast('info', 'Loaded Sample', preset.label);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Utility Tools: Import TXT & Clear */}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 transition"
                  title="Upload .txt script"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import TXT</span>
                </button>

                <button
                  onClick={() => setScriptText('')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Clear text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 min-h-[300px] flex flex-col">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Start typing or paste your script here..."
                rows={12}
                className="w-full flex-1 p-3 text-base leading-relaxed text-navy-900 dark:text-slate-100 bg-transparent resize-y border-none focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 font-sans"
              />
            </div>

            {/* Bottom Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-4">
                <span>
                  <strong className="text-navy-900 dark:text-white">{charCount}</strong> characters
                </span>
                <span>
                  <strong className="text-navy-900 dark:text-white">{wordCount}</strong> words
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-medium">
                  <Layers className="w-3 h-3" />
                  <span>{chunkCount} {chunkCount === 1 ? 'paragraph block' : 'seamless chunks'}</span>
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                Punctuation auto-normalized &bull; Studio Vocoder
              </div>
            </div>
          </div>

          {/* AUDIO PLAYER (Displayed after generation or if project has audio) */}
          {generatedAudioUrl ? (
            <AudioPlayer
              audioUrl={generatedAudioUrl}
              duration={audioDuration}
              voiceName={selectedVoice.name}
              onRegenerate={handleGenerateSpeech}
              isGenerating={isGenerating}
            />
          ) : (
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-navy-900/40 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-navy-900 dark:text-white">
                Audio Waveform Visualizer
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Click "Generate Speech" above to synthesize and inspect the audio waveform timeline with millisecond precision.
              </p>
            </div>
          )}

          {/* VOICE SETTINGS PANEL */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                  Voice & Nuance Controls
                </h3>
              </div>

              <button
                onClick={() => {
                  setSpeed(1.0);
                  setPitch(1.0);
                  setVolume(1.0);
                  setStability(0.75);
                  onShowToast('info', 'Settings Reset', 'Speed, pitch, and stability returned to defaults.');
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Sliders</span>
              </button>
            </div>

            {/* Voice Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Selected Voice Dropdown Trigger */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Voice Model
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-800 hover:border-brand-400 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={selectedVoice.avatar}
                        alt={selectedVoice.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="text-left truncate">
                        <div className="text-xs font-bold text-navy-900 dark:text-white truncate">
                          {selectedVoice.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {selectedVoice.language} &bull; {selectedVoice.category}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isVoiceDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full max-h-72 overflow-y-auto bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span>Select Voice</span>
                        <button
                          onClick={() => {
                            setIsVoiceDropdownOpen(false);
                            onNavigateToVoices();
                          }}
                          className="text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <span>Full Library</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {filteredVoices.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            onSelectVoice(v);
                            setIsVoiceDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                            v.id === selectedVoice.id
                              ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-navy-900 dark:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={v.avatar} alt={v.name} className="w-7 h-7 rounded-md object-cover" />
                            <div className="truncate">
                              <div className="text-xs">{v.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{v.language}</div>
                            </div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {v.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Preview & Gender Filter */}
              <div className="flex flex-col justify-end">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Voice Preview & Quick Filter
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviewVoice}
                    disabled={isPreviewLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-navy-900 dark:text-white transition"
                  >
                    {isPreviewPlaying ? (
                      <Pause className="w-3.5 h-3.5 text-brand-600 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-brand-600 fill-current" />
                    )}
                    <span>{isPreviewPlaying ? 'Pause Sample' : 'Preview Voice'}</span>
                  </button>

                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
                    {(['All', 'Female', 'Male'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenderFilter(g)}
                        className={`px-2 py-1 rounded-lg transition ${
                          genderFilter === g
                            ? 'bg-white dark:bg-navy-700 font-bold text-brand-600 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sliders Grid: Speed, Pitch, Stability, Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {/* Speed Slider */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-navy-900 dark:text-white">Speaking Speed</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>0.5x Slow</span>
                  <span>1.0x Normal</span>
                  <span>2.0x Fast</span>
                </div>
              </div>

              {/* Pitch Slider */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-navy-900 dark:text-white">Pitch Modulator</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">
                    {pitch > 1 ? `+${Math.round((pitch - 1) * 100)}%` : pitch < 1 ? `-${Math.round((1 - pitch) * 100)}%` : '0%'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.02"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>Deeper</span>
                  <span>Default</span>
                  <span>Higher</span>
                </div>
              </div>

              {/* Stability Slider (ElevenLabs style) */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-navy-900 dark:text-white">Nuance & Stability</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{Math.round(stability * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>Dynamic</span>
                  <span>Balanced</span>
                  <span>Stable</span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-navy-900 dark:text-white">Output Volume</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>20%</span>
                  <span>100% Normal</span>
                  <span>150% Boost</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: VOICE PROFILE & STUDIO INSIGHTS (Col 9 to 12) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Active Voice Card */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selected Voice Profile
              </span>
              <button
                onClick={onNavigateToVoices}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <img
                src={selectedVoice.avatar}
                alt={selectedVoice.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="font-extrabold text-base text-navy-900 dark:text-white">
                  {selectedVoice.name}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedVoice.language} &bull; {selectedVoice.accent}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {selectedVoice.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {selectedVoice.gender}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {selectedVoice.description}
            </p>

            {/* Settings Summary Badge List */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Speech Rate</span>
                <span className="font-mono font-semibold text-navy-900 dark:text-white">{speed}x</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Pitch</span>
                <span className="font-mono font-semibold text-navy-900 dark:text-white">
                  {pitch === 1.0 ? 'Default' : `${pitch}x`}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Format</span>
                <span className="font-mono font-semibold text-navy-900 dark:text-white uppercase">
                  {audioFormat} (48kHz)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Engine</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  Neural Edge / Studio
                </span>
              </div>
            </div>
          </div>

          {/* Recent Generations in Studio */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Generations
              </span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {recentHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No recent generations yet. Generate speech to see items here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setGeneratedAudioUrl(item.audio_url);
                      setAudioDuration(item.duration);
                      onShowToast('info', 'Loaded Audio', `Loaded "${item.title}"`);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-navy-950/40 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-navy-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400">
                        {item.duration}s
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.text_snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Studio Tips */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-50/70 to-indigo-50/70 dark:from-navy-900 dark:to-brand-950/30 border border-brand-200/50 dark:border-brand-900/40">
            <div className="flex items-center gap-2 mb-2 text-brand-800 dark:text-brand-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 fill-current text-brand-600" />
              <span>Studio Voiceover Tips</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>&bull; Insert commas <code className="bg-white/80 dark:bg-navy-800 px-1 rounded">,</code> for natural conversational breath pauses.</li>
              <li>&bull; Use ellipses <code className="bg-white/80 dark:bg-navy-800 px-1 rounded">...</code> for deliberate suspense or dramatic pacing.</li>
              <li>&bull; Hyphens <code className="bg-white/80 dark:bg-navy-800 px-1 rounded">-</code> emphasize multi-word product names cleanly.</li>
              <li>&bull; Paragraph-level chunking automatically safeguards scripts over 5,000 words.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

