import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  Trash2,
  Upload,
  RotateCcw,
  Play,
  Pause,
  ChevronDown,
  Clock,
  Layers,
  ArrowRight,
  Sliders,
  Volume2,
  ExternalLink,
  Check
} from 'lucide-react';
import type { Voice, Project, HistoryItem } from '../types';
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
    label: 'Haute Horlogerie',
    text: 'True luxury does not clamor for attention. It exists in the quiet cadence of deliberate craftsmanship, where every second is measured in micro-mechanics and human emotion.',
  },
  {
    label: 'Literary Prologue',
    text: 'Deep within the archives of time, humanity has always sought the perfect vehicle for its grandest narratives. As the night mist folded across the valley, a single lantern illuminated the manuscript.',
  },
  {
    label: 'Sensory Meditation',
    text: 'Breathe gently. Allow the weightless clarity of expression to settle into your consciousness. Release all tension in your shoulders and arrive fully in this still, tranquil moment.',
  },
  {
    label: 'Curated Retrospective',
    text: 'Welcome to this evening’s retrospective. Tonight, we analyze the silent revolution in generative acoustic synthesis and what it means for artists composing in high-fidelity sound.',
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
  const [projectTitle, setProjectTitle] = useState(currentProject?.title || 'Master Acoustic Session');
  const [scriptText, setScriptText] = useState(
    currentProject?.script_text ||
      'True luxury does not clamor for attention. It exists in the quiet cadence of deliberate craftsmanship, where every word resonates with genuine human emotion.'
  );

  // Settings State
  const [speed, setSpeed] = useState(currentProject?.speed || 1.0);
  const [pitch, setPitch] = useState(currentProject?.pitch || 1.0);
  const [volume, setVolume] = useState(currentProject?.volume || 1.0);
  const [stability, setStability] = useState(currentProject?.stability || 0.75);
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav'>('mp3');

  // Filters for Voice Selector
  const [genderFilter, setGenderFilter] = useState<'All' | 'Female' | 'Male'>('All');
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

  // Generation & Audio State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(currentProject?.audio_url || null);
  const [audioDuration, setAudioDuration] = useState<number>(currentProject?.audio_duration || 0);

  // Voice Preview in Studio
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Recent generations
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
    return true;
  });

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
        onShowToast('success', 'Session Preserved', `"${projectTitle}" updated in cloud storage.`);
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
        onShowToast('success', 'Session Created', `"${projectTitle}" archived to private projects.`);
      }
    } catch (err: any) {
      onShowToast('error', 'Preservation Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate Speech
  const handleGenerateSpeech = async () => {
    if (!scriptText.trim()) {
      onShowToast('error', 'Empty Manuscript', 'Please compose or paste your text before generating speech.');
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
        'Acoustic Synthesis Complete',
        `Rendered ${res.duration}s broadcast master with ${selectedVoice.name}.`
      );
    } catch (err: any) {
      onShowToast('error', 'Synthesis Interrupted', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview Voice
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
      if (projectTitle === 'Master Acoustic Session') {
        setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      onShowToast('success', 'Manuscript Imported', `Loaded ${data.word_count} words from ${file.name}`);
    } catch (err: any) {
      onShowToast('error', 'Import Failed', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#F5F1E8] flex flex-col">
      <audio
        ref={previewAudioRef}
        onEnded={() => setIsPreviewPlaying(false)}
        onError={() => setIsPreviewPlaying(false)}
      />

      {/* TOP EDITORIAL STUDIO HEADER */}
      <header className="sticky top-0 z-30 bg-[#090A0C]/90 backdrop-blur-xl border-b border-[#302D27]/80 px-6 sm:px-8 py-3.5">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Workspace Title & Project Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full border border-[#C8A96B]/50 flex items-center justify-center bg-[#17181C] shadow-gold-sm">
              <span className="w-2 h-2 rounded-full bg-[#C8A96B]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="font-serif text-xl sm:text-2xl font-normal text-[#F5F1E8] bg-transparent border-b border-transparent hover:border-[#302D27] focus:border-[#C8A96B] focus:outline-none transition py-0.5 px-1 -ml-1 rounded"
                  placeholder="Session Title..."
                />
                <span className="text-[9.5px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-[#17181C] text-[#C8A96B] border border-[#302D27]">
                  {currentProject?.id ? 'ARCHIVED' : 'DRAFT SESSION'}
                </span>
              </div>
              <p className="text-[11px] text-[#A5A29B] font-light tracking-wide">
                VOXORA Atelier &bull; {selectedVoice.name} &bull; {selectedVoice.language}
              </p>
            </div>
          </div>

          {/* Top Actions: Save Session */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveProject}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-[0.16em] text-[#A5A29B] hover:text-[#F5F1E8] bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/50 shadow-xs transition disabled:opacity-50"
            >
              <Save className={`w-3.5 h-3.5 text-[#C8A96B] ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Preserving...' : 'Save Session'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* EDITORIAL BALANCED WORKSPACE */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CENTER / MAIN WRITING & SYNTHESIS AREA (Col 1 to 8) */}
        <div className="lg:col-span-8 flex flex-col space-y-7">
          {/* EDITORIAL WRITING SURFACE */}
          <div className="rounded-3xl border border-[#302D27] bg-[#101114] shadow-luxury p-7 sm:p-9 flex flex-col flex-1 relative overflow-hidden">
            {/* Subtle top metallic hairline */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8A96B]/25 to-transparent" />

            {/* Editorial Header */}
            <div className="pb-6 mb-6 border-b border-[#302D27]/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#F5F1E8] tracking-tight">
                    Create Something Extraordinary.
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A5A29B] font-light tracking-wide mt-1">
                    Your words. Your voice. Your expression.
                  </p>
                </div>

                {/* Import TXT & Clear Actions */}
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#A5A29B] hover:text-[#F5F1E8] bg-[#17181C] border border-[#302D27] hover:border-[#C8A96B]/50 transition"
                    title="Import plain text manuscript"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>Import Text</span>
                  </button>

                  <button
                    onClick={() => setScriptText('')}
                    className="p-1.5 rounded-full text-[#706E69] hover:text-rose-400 hover:bg-[#1D1E22] transition"
                    title="Clear manuscript text"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sample Presets */}
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-[#302D27]/40">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#706E69] mr-2">
                  Audition Excerpts:
                </span>
                {SAMPLE_SCRIPTS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setScriptText(preset.text);
                      onShowToast('info', 'Excerpt Loaded', preset.label);
                    }}
                    className="px-3 py-1 rounded-full text-[11px] font-mono text-[#A5A29B] hover:text-[#E4D1A1] bg-[#17181C] border border-[#302D27] hover:border-[#C8A96B]/40 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Surface */}
            <div className="flex-1 min-h-[280px] flex flex-col mb-4">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Start typing or paste your manuscript here..."
                rows={10}
                className="w-full flex-1 p-2 text-lg sm:text-xl font-light leading-relaxed text-[#F5F1E8] bg-transparent resize-y border-none focus:outline-none placeholder:text-[#302D27] font-serif selection:bg-[#C8A96B]/20"
              />
            </div>

            {/* Bottom Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#302D27]/80 text-xs font-mono text-[#A5A29B]">
              <div className="flex items-center space-x-5">
                <span>
                  <strong className="text-[#F5F1E8] font-semibold">{charCount}</strong> characters
                </span>
                <span>
                  <strong className="text-[#F5F1E8] font-semibold">{wordCount}</strong> words
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#17181C] text-[#C8A96B] border border-[#302D27]">
                  <Layers className="w-3 h-3" />
                  <span>{chunkCount} {chunkCount === 1 ? 'block' : 'seamless chunks'}</span>
                </span>
              </div>

              <div className="text-[11px] text-[#706E69]">
                Neural Diffusion Vocoder &bull; 48kHz Master
              </div>
            </div>
          </div>

          {/* TACTILE HARDWARE GENERATION BUTTON */}
          <div>
            <button
              onClick={handleGenerateSpeech}
              disabled={isGenerating || !scriptText.trim()}
              className="w-full btn-gold py-5 rounded-2xl text-sm font-bold tracking-[0.25em] flex items-center justify-center gap-3 transition transform active:scale-99 disabled:opacity-50 relative overflow-hidden group"
            >
              <Sparkles className={`w-4 h-4 fill-current ${isGenerating ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
              <span>{isGenerating ? 'SYNTHESIZING NEURAL HARMONICS...' : 'GENERATE SPEECH'}</span>
            </button>
          </div>

          {/* LUXURY AUDIO PLAYER (Displayed after generation or if loaded) */}
          {generatedAudioUrl ? (
            <AudioPlayer
              audioUrl={generatedAudioUrl}
              duration={audioDuration}
              voiceName={selectedVoice.name}
              onRegenerate={handleGenerateSpeech}
              isGenerating={isGenerating}
            />
          ) : (
            <div className="p-8 rounded-3xl border border-dashed border-[#302D27] bg-[#141519]/50 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-[#17181C] border border-[#302D27] flex items-center justify-center text-[#C8A96B] mb-3 shadow-inner-metal">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-medium text-[#F5F1E8]">
                Acoustic Waveform Visualizer
              </h4>
              <p className="text-xs text-[#A5A29B] font-light max-w-sm mt-1">
                Touch "GENERATE SPEECH" above to render your words through our high-definition neural engine.
              </p>
            </div>
          )}

          {/* TACTILE VOICE CONTROLS PANEL */}
          <div className="rounded-3xl border border-[#302D27] bg-[#101114] shadow-luxury p-7 sm:p-8">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#302D27]/80">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-[#C8A96B]" />
                <h3 className="font-serif text-xl font-normal text-[#F5F1E8]">
                  Vocal Nuance Controls
                </h3>
              </div>

              <button
                onClick={() => {
                  setSpeed(1.0);
                  setPitch(1.0);
                  setVolume(1.0);
                  setStability(0.75);
                  onShowToast('info', 'Calibrations Reset', 'Velocity, pitch, and stability returned to baseline.');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#706E69] hover:text-[#E4D1A1] transition"
              >
                <RotateCcw className="w-3 h-3 text-[#C8A96B]" />
                <span>Reset Sliders</span>
              </button>
            </div>

            {/* Voice Model Selector Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {/* Voice Dropdown */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A5A29B] mb-2">
                  Selected Instrument
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#302D27] bg-[#17181C] hover:border-[#C8A96B]/60 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={selectedVoice.avatar}
                        alt={selectedVoice.name}
                        className="w-9 h-9 rounded-xl object-cover border border-[#302D27]"
                      />
                      <div className="text-left truncate">
                        <div className="text-xs font-semibold text-[#F5F1E8] truncate">
                          {selectedVoice.name}
                        </div>
                        <div className="text-[10.5px] text-[#A5A29B] font-light truncate">
                          {selectedVoice.language} &bull; {selectedVoice.category}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isVoiceDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full max-h-72 overflow-y-auto bg-[#17181C] border border-[#302D27] rounded-2xl shadow-2xl z-30 p-2 space-y-1">
                      <div className="p-2 border-b border-[#302D27] flex items-center justify-between text-[11px] font-mono text-[#706E69]">
                        <span>SELECT INSTRUMENT</span>
                        <button
                          onClick={() => {
                            setIsVoiceDropdownOpen(false);
                            onNavigateToVoices();
                          }}
                          className="text-[#C8A96B] hover:underline flex items-center gap-1"
                        >
                          <span>Full Atelier</span>
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
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                            v.id === selectedVoice.id
                              ? 'bg-[#1D1E22] text-[#E4D1A1] border border-[#C8A96B]/50 font-bold'
                              : 'hover:bg-[#141519] text-[#F5F1E8]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <img src={v.avatar} alt={v.name} className="w-7 h-7 rounded-lg object-cover" />
                            <div className="truncate">
                              <div className="text-xs">{v.name}</div>
                              <div className="text-[10px] text-[#A5A29B] font-light">{v.language}</div>
                            </div>
                          </div>
                          <span className="text-[9.5px] font-mono uppercase px-2 py-0.5 rounded bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">
                            {v.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Audition Voice Sample */}
              <div className="flex flex-col justify-end">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A5A29B]">
                    Instant Audition
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePreviewVoice}
                    disabled={isPreviewLoading}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border border-[#302D27] bg-[#17181C] hover:border-[#C8A96B]/60 text-xs font-mono uppercase tracking-wider text-[#F5F1E8] transition"
                  >
                    {isPreviewPlaying ? (
                      <Pause className="w-3.5 h-3.5 text-[#C8A96B] fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-[#C8A96B] fill-current" />
                    )}
                    <span>{isPreviewPlaying ? 'Pause Sample' : 'Audition Sample'}</span>
                  </button>

                  <div className="flex rounded-xl bg-[#090A0C] p-1 border border-[#302D27] text-xs font-mono">
                    {(['All', 'Female', 'Male'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenderFilter(g)}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          genderFilter === g
                            ? 'bg-[#C8A96B] text-[#090A0C] font-bold'
                            : 'text-[#A5A29B] hover:text-[#F5F1E8]'
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
              <div className="p-4 rounded-2xl bg-[#090A0C] border border-[#302D27]">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-[#A5A29B]">Velocity</span>
                  <span className="text-[#C8A96B] font-bold">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#302D27] rounded-lg appearance-none cursor-pointer accent-[#C8A96B]"
                />
                <div className="flex justify-between text-[9.5px] font-mono text-[#706E69] mt-2">
                  <span>Adagio (0.5x)</span>
                  <span>Allegro (2.0x)</span>
                </div>
              </div>

              {/* Pitch Slider */}
              <div className="p-4 rounded-2xl bg-[#090A0C] border border-[#302D27]">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-[#A5A29B]">Pitch Tone</span>
                  <span className="text-[#C8A96B] font-bold">
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
                  className="w-full h-1.5 bg-[#302D27] rounded-lg appearance-none cursor-pointer accent-[#C8A96B]"
                />
                <div className="flex justify-between text-[9.5px] font-mono text-[#706E69] mt-2">
                  <span>Resonant Deep</span>
                  <span>Higher Octave</span>
                </div>
              </div>

              {/* Stability Slider (ElevenLabs style) */}
              <div className="p-4 rounded-2xl bg-[#090A0C] border border-[#302D27]">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-[#A5A29B]">Stability</span>
                  <span className="text-[#C8A96B] font-bold">{Math.round(stability * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#302D27] rounded-lg appearance-none cursor-pointer accent-[#C8A96B]"
                />
                <div className="flex justify-between text-[9.5px] font-mono text-[#706E69] mt-2">
                  <span>Expressive</span>
                  <span>Controlled</span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="p-4 rounded-2xl bg-[#090A0C] border border-[#302D27]">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-[#A5A29B]">Presence</span>
                  <span className="text-[#C8A96B] font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#302D27] rounded-lg appearance-none cursor-pointer accent-[#C8A96B]"
                />
                <div className="flex justify-between text-[9.5px] font-mono text-[#706E69] mt-2">
                  <span>Gentle</span>
                  <span>Fortissimo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: INSTRUMENT PROFILE & STUDIO INSIGHTS (Col 9 to 12) */}
        <div className="lg:col-span-4 flex flex-col space-y-7">
          {/* Active Voice Instrument Card */}
          <div className="rounded-3xl border border-[#302D27] bg-[#101114] shadow-luxury p-7 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#302D27]/80">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C8A96B]">
                INSTRUMENT PROFILE
              </span>
              <button
                onClick={onNavigateToVoices}
                className="text-xs font-mono tracking-wider text-[#A5A29B] hover:text-[#E4D1A1] flex items-center gap-1.5 transition"
              >
                <span>Browse Atelier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-start gap-4 mb-5">
              <img
                src={selectedVoice.avatar}
                alt={selectedVoice.name}
                className="w-18 h-18 rounded-2xl object-cover border border-[#302D27] shadow-inner-metal"
              />
              <div>
                <h3 className="font-serif text-2xl font-normal text-[#F5F1E8]">
                  {selectedVoice.name}
                </h3>
                <div className="text-xs text-[#A5A29B] font-light mt-0.5">
                  {selectedVoice.language} &bull; {selectedVoice.accent}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[9.5px] font-mono uppercase tracking-wider bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">
                    {selectedVoice.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[9.5px] font-mono uppercase tracking-wider bg-[#090A0C] text-[#706E69] border border-[#302D27]">
                    {selectedVoice.gender}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#A5A29B] leading-relaxed mb-6 font-light">
              {selectedVoice.description}
            </p>

            {/* Precision Summary Table */}
            <div className="p-4 rounded-2xl bg-[#090A0C] border border-[#302D27] space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#706E69]">VELOCITY</span>
                <span className="text-[#F5F1E8] font-bold">{speed.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#706E69]">PITCH MODIFIER</span>
                <span className="text-[#F5F1E8] font-bold">{pitch === 1.0 ? 'Baseline' : `${pitch}x`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#706E69]">CONTAINER</span>
                <span className="text-[#C8A96B] font-bold uppercase">{audioFormat} (48KHZ)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#706E69]">DIFFUSION ENGINE</span>
                <span className="text-[#E4D1A1] font-bold">Neural Studio Pro</span>
              </div>
            </div>
          </div>

          {/* Recent Generations In Atelier */}
          <div className="rounded-3xl border border-[#302D27] bg-[#101114] shadow-luxury p-7 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#302D27]/80">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C8A96B]">
                RECENT RECORDINGS
              </span>
              <Clock className="w-3.5 h-3.5 text-[#706E69]" />
            </div>

            {recentHistory.length === 0 ? (
              <p className="text-xs text-[#706E69] py-4 text-center font-light">
                No archived recordings yet. Generate speech to populate your session log.
              </p>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setGeneratedAudioUrl(item.audio_url);
                      setAudioDuration(item.duration);
                      onShowToast('info', 'Loaded Recording', `Loaded "${item.title}"`);
                    }}
                    className="p-3.5 rounded-2xl border border-[#302D27] hover:border-[#C8A96B]/60 bg-[#141519] cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-serif font-medium text-[#F5F1E8] group-hover:text-[#E4D1A1] transition truncate">
                        {item.title}
                      </div>
                      <span className="text-[10px] font-mono text-[#C8A96B]">
                        {item.duration}s
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5A29B] font-light truncate mt-1">
                      "{item.text_snippet}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Luxury Studio Nuance Advice */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#17181C] to-[#101114] border border-[#302D27] shadow-luxury">
            <div className="flex items-center gap-2 mb-3 text-[#C8A96B] font-mono text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Acoustic Craft Tips</span>
            </div>
            <ul className="space-y-2 text-xs text-[#A5A29B] font-light leading-relaxed">
              <li>&bull; <strong className="text-[#F5F1E8]">Commas (,)</strong> introduce deliberate 200ms natural breath suspensions.</li>
              <li>&bull; <strong className="text-[#F5F1E8]">Ellipses (...)</strong> generate cinematic hesitation or reflective pauses.</li>
              <li>&bull; <strong className="text-[#F5F1E8]">Hyphens (-)</strong> articulate compound luxury terms with distinct phonetics.</li>
              <li>&bull; Long scripts (5,000+ words) are synthesized in continuous harmonic chunk blocks.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};
