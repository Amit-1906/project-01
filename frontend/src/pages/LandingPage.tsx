import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Headphones,
  Sliders,
  Download,
  Globe2,
  Mic,
  Zap,
  Check,
  Play,
  Layers,
  ShieldCheck,
  BookOpen,
  Radio,
  Tv,
  Gamepad2
} from 'lucide-react';
import { WaveformHero } from '../components/WaveformHero';
import { PageId } from '../components/Sidebar';
import { Voice } from '../types';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
  onSelectVoice: (voice: Voice) => void;
  featuredVoices: Voice[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectVoice,
  featuredVoices,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const useCases = [
    {
      title: 'Podcasts & Radio Shows',
      desc: 'Produce captivating audio episodes, dynamic intro hooks, and synthetic co-hosts in studio-fidelity 48kHz audio.',
      icon: Radio,
      badge: 'Broadcasting',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Audiobooks & Long-form',
      desc: 'Seamless paragraph chunking and character inflection designed for rich, multi-chapter literary narrations.',
      icon: BookOpen,
      badge: 'Publishing',
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Video & Social Commercials',
      desc: 'Engage TikTok, YouTube, and corporate audiences with authentic voices that convert viewers into loyal customers.',
      icon: Tv,
      badge: 'Marketing',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Gaming & Interactive Media',
      desc: 'Give distinct personas to NPC dialogue, fantasy protagonists, and interactive voice agents with zero latency.',
      icon: Gamepad2,
      badge: 'Gaming',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  const features = [
    {
      title: 'Paragraph-Level Synthesis',
      desc: 'Automatic text segmentation ensures natural pacing and eliminates robotic breathlessness on long scripts.',
      icon: Layers,
    },
    {
      title: 'Expressive Neural Vocoders',
      desc: 'Engineered with cutting-edge diffusion and neural models for lifelike warmth, micro-inflections, and nuance.',
      icon: Mic,
    },
    {
      title: 'Multilingual Global Reach',
      desc: 'Synthesize across 40+ languages and dozens of regional accents with native phonetic accuracy.',
      icon: Globe2,
    },
    {
      title: 'Real-Time Waveform Scrubbing',
      desc: 'Inspect frequency response, adjust pitch and velocity with millisecond timeline synchronization.',
      icon: Sliders,
    },
    {
      title: 'Broadcast-Grade Export',
      desc: 'Download in lossless WAV (44.1kHz / 48kHz) or high-bitrate 320kbps MP3 ready for immediate publication.',
      icon: Download,
    },
    {
      title: 'Commercial Rights Guaranteed',
      desc: 'Full commercial license included with all generations for monetization on any streaming platform.',
      icon: ShieldCheck,
    },
  ];

  const languages = [
    { name: 'English (US & UK)', flag: '🇺🇸 / 🇬🇧', count: '14 Voices' },
    { name: 'Spanish (Castilian & LatAm)', flag: '🇪🇸 / 🇲🇽', count: '8 Voices' },
    { name: 'French (Parisian & Canadian)', flag: '🇫🇷 / 🇨🇦', count: '6 Voices' },
    { name: 'German (Hochdeutsch)', flag: '🇩🇪', count: '5 Voices' },
    { name: 'Japanese (Tokyo Dialect)', flag: '🇯🇵', count: '4 Voices' },
    { name: 'Hindi (Standard & Regional)', flag: '🇮🇳', count: '6 Voices' },
    { name: 'Italian (Standard)', flag: '🇮🇹', count: '4 Voices' },
    { name: 'Portuguese (Brazilian & European)', flag: '🇧🇷 / 🇵🇹', count: '4 Voices' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-brand-300/30 via-indigo-200/20 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/70 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-semibold mb-8 shadow-xs animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-ping" />
          <span>VOXORA 2.0 &bull; Studio Neural Architecture</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-navy-900 dark:text-white max-w-4xl mx-auto font-['Plus_Jakarta_Sans'] leading-[1.1]">
          Give Your Words <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
            a Human Voice.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Transform any text into expressive, natural-sounding speech with AI. Experience unprecedented emotional depth, nuance, and studio clarity.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('studio')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 shadow-lg shadow-brand-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>Start Creating Free</span>
          </button>

          <button
            onClick={() => onNavigate('voices')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-navy-900 dark:text-white bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs transition"
          >
            <Headphones className="w-5 h-5 text-brand-600" />
            <span>Explore 50+ AI Voices</span>
          </button>
        </div>

        {/* Interactive Waveform Visualizer & Live Demo in Hero */}
        <div className="mt-14">
          <WaveformHero />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white/70 dark:bg-navy-900/60 border-y border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2">
              Simple 3-Step Process
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans']">
              From Written Concept to Studio Master
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-3xl bg-surface-light dark:bg-navy-800/60 border border-slate-200/70 dark:border-slate-700 shadow-subtle group hover:border-brand-400 transition">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 flex items-center justify-center font-extrabold text-lg mb-6 shadow-xs">
                01
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">
                Input or Import Script
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Type directly into our distraction-free editor or import any plain text (.txt) file. Automatic normalization cleans syntax instantly.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-surface-light dark:bg-navy-800/60 border border-slate-200/70 dark:border-slate-700 shadow-subtle group hover:border-brand-400 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-extrabold text-lg mb-6 shadow-xs">
                02
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">
                Fine-tune Voice & Cadence
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Select from our curated library of 50+ voices. Tailor speed, pitch, stability, and emotional delivery with responsive sliders.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-surface-light dark:bg-navy-800/60 border border-slate-200/70 dark:border-slate-700 shadow-subtle group hover:border-brand-400 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-extrabold text-lg mb-6 shadow-xs">
                03
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">
                Synthesize & Export
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate speech in seconds with our high-definition neural engine. Preview waveforms interactively and export lossless audio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE AI VOICES SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2">
              Human In Every Inflection
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Featured Voice Profiles
            </p>
          </div>
          <button
            onClick={() => onNavigate('voices')}
            className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
          >
            <span>View All 50+ Voices</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVoices.slice(0, 4).map((voice) => (
            <div
              key={voice.id}
              className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-slate-700 shadow-subtle hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={voice.avatar}
                    alt={voice.name}
                    className="w-12 h-12 rounded-xl object-cover shadow-xs border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-navy-900 dark:text-white text-base">
                      {voice.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {voice.language} &bull; {voice.accent}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {voice.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {voice.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700">
                    {voice.gender}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectVoice(voice);
                  onNavigate('studio');
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 hover:bg-brand-100 dark:hover:bg-brand-900/80 transition"
              >
                Open in Studio
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES & CAPABILITIES */}
      <section id="features" className="py-20 bg-slate-50/70 dark:bg-navy-900/50 border-t border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2">
              Architected for Perfection
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Cutting-Edge Neural Features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-slate-700 shadow-subtle hover:shadow-card transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-navy-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUPPORTED LANGUAGES */}
      <section id="languages" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2">
            Global Accents
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans']">
            Speak to Every Audience in Their Native Tongue
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {languages.map((lang, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-slate-700 text-center hover:border-brand-400 transition"
            >
              <div className="text-2xl mb-1">{lang.flag}</div>
              <div className="text-sm font-bold text-navy-900 dark:text-white truncate">
                {lang.name}
              </div>
              <div className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1">
                {lang.count}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-20 bg-white/70 dark:bg-navy-900/60 border-t border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2">
              Versatile Applications
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Engineered for Every Creator & Enterprise
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-surface-light dark:bg-navy-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {uc.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-navy-900 dark:text-white mb-2">
                      {uc.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {uc.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2">
            Transparent Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white font-['Plus_Jakarta_Sans']">
            Invest in Pristine Audio Production
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="p-8 rounded-3xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Starter
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-navy-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500">/ forever free</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Ideal for creators exploring neural text-to-speech and testing studio capabilities.
              </p>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Neural Studio speech generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>50+ High-Definition Voices included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Interactive WaveSurfer waveform player</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Standard MP3 export format</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('studio')}
              className="w-full py-3 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/80 hover:bg-brand-100 transition"
            >
              Get Started Free
            </button>
          </div>

          {/* Creator Pro (Featured) */}
          <div className="relative p-8 rounded-3xl bg-white dark:bg-navy-800 border-2 border-brand-500 shadow-premium flex flex-col justify-between ring-4 ring-brand-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
              Most Popular
            </div>
            <div>
              <div className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
                Creator Pro
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-navy-900 dark:text-white">
                  {billingCycle === 'monthly' ? '$24' : '$19'}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Designed for podcasters, educators, YouTubers, and commercial voice talent.
              </p>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>Everything in Starter + Priority Queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>Lossless 48kHz WAV audio export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>Full Commercial Monetization Rights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>Long-script paragraph chunking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>OpenAI & ElevenLabs custom API key support</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('studio')}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md transition"
            >
              Start 14-Day Pro Trial
            </button>
          </div>

          {/* Enterprise Studio */}
          <div className="p-8 rounded-3xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Enterprise Studio
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-navy-900 dark:text-white">
                  {billingCycle === 'monthly' ? '$89' : '$72'}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Built for publishers, game studios, and agency teams producing massive volumes.
              </p>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited multi-seat team workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Custom voice cloning & dedicated fine-tuning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>REST API integration & webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Dedicated account manager & 99.99% SLA</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('studio')}
              className="w-full py-3 rounded-xl text-xs font-bold text-navy-900 dark:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-navy-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-navy-900 dark:text-white font-['Plus_Jakarta_Sans']">
              VOXORA
            </span>
            <span className="text-xs text-slate-400">&bull; Premium AI Voice Studio &copy; 2026</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400">
            <button onClick={() => onNavigate('studio')} className="hover:text-brand-600 transition">
              AI Voice Studio
            </button>
            <button onClick={() => onNavigate('voices')} className="hover:text-brand-600 transition">
              Voice Library
            </button>
            <button onClick={() => onNavigate('projects')} className="hover:text-brand-600 transition">
              Projects
            </button>
            <button onClick={() => onNavigate('settings')} className="hover:text-brand-600 transition">
              Settings & API
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

