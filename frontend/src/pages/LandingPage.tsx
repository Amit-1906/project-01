import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Headphones,
  Sliders,
  Download,
  Globe2,
  Mic,
  Check,
  Layers,
  ShieldCheck,
  BookOpen,
  Radio,
  Tv,
  Gamepad2
} from 'lucide-react';
import { WaveformHero } from '../components/WaveformHero';
import type { PageId } from '../components/Sidebar';
import type { Voice } from '../types';

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
      title: 'Broadcast & Mastered Podcasts',
      desc: 'Infuse your episodes with the vocal presence of master narrators, rendered in uncompressed 48kHz acoustic fidelity.',
      icon: Radio,
      badge: 'Broadcasting',
    },
    {
      title: 'Literary Audio & Long-Form',
      desc: 'Seamless multi-chapter synthesis with emotional micro-pauses and cadence preservation across thousands of sentences.',
      icon: BookOpen,
      badge: 'Publishing',
    },
    {
      title: 'Haute Horlogerie & Cinematic Film',
      desc: 'Subtle, evocative narrations tailored for luxury branding, documentaries, and high-production commercials.',
      icon: Tv,
      badge: 'Editorial',
    },
    {
      title: 'Interactive Spatial Environments',
      desc: 'Give distinctive sonic identity to interactive worlds, historical figures, and private luxury voice assistants.',
      icon: Gamepad2,
      badge: 'Spatial AI',
    },
  ];

  const craftPrinciples = [
    {
      title: 'Paragraph-Level Resonance',
      desc: 'Advanced contextual sentence chunking eliminates synthetic breathlessness, ensuring organic poetic rhythm.',
      icon: Layers,
    },
    {
      title: 'Neural Diffusion Vocoders',
      desc: 'Architected with private studio diffusion models capturing subtle vocal tract textures and vocal fry.',
      icon: Mic,
    },
    {
      title: '40+ Sovereign Languages',
      desc: 'Synthesize across global languages with native phonetic accuracy and refined regional inflection.',
      icon: Globe2,
    },
    {
      title: 'Hardware-Grade Waveform Scrubbing',
      desc: 'Inspect frequency spectrums with millisecond timeline synchronization and precision cadence tuning.',
      icon: Sliders,
    },
    {
      title: 'Uncompressed Lossless Audio',
      desc: 'Direct export to studio-grade WAV (48kHz / 24-bit) or broadcast 320kbps MP3 ready for final audio mastering.',
      icon: Download,
    },
    {
      title: 'Perpetual Commercial Freedom',
      desc: 'Full commercial rights granted on all synthesized assets, cleared for worldwide broadcast and distribution.',
      icon: ShieldCheck,
    },
  ];

  const dialects = [
    { name: 'English (US & UK)', flag: '🇺🇸 / 🇬🇧', count: '14 Instruments', locale: 'Received Pronunciation & US' },
    { name: 'Castilian & LatAm Spanish', flag: '🇪🇸 / 🇲🇽', count: '8 Instruments', locale: 'Madrid & Mexico City' },
    { name: 'Parisian French', flag: '🇫🇷', count: '6 Instruments', locale: 'Haute Couture Cadence' },
    { name: 'Hochdeutsch German', flag: '🇩🇪', count: '5 Instruments', locale: 'Precision Diction' },
    { name: 'Tokyo Japanese', flag: '🇯🇵', count: '4 Instruments', locale: 'Melodic Honorific' },
    { name: 'Standard Hindi', flag: '🇮🇳', count: '6 Instruments', locale: 'Poetic & Contemporary' },
    { name: 'Italian Classico', flag: '🇮🇹', count: '4 Instruments', locale: 'Tuscan & Milanese' },
    { name: 'Portuguese', flag: '🇧🇷 / 🇵🇹', count: '4 Instruments', locale: 'Lisbon & São Paulo' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#090A0C]">
      {/* Ambient Gold Atmospheric Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#C8A96B]/10 via-[#E4D1A1]/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[#C8A96B]/5 blur-[120px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="pt-24 pb-20 sm:pt-32 sm:pb-28 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto text-center">
        {/* Small uppercase luxury label */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#17181C] border border-[#302D27] text-[#C8A96B] text-[10.5px] sm:text-[11.5px] font-mono tracking-[0.28em] uppercase mb-10 shadow-gold-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] animate-pulse" />
          <span>THE NEXT GENERATION OF AI VOICE</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal text-[#F5F1E8] max-w-5xl mx-auto leading-[1.06] tracking-tight">
          Words Deserve <br />
          <span className="italic font-serif gold-text-pure">A Beautiful Voice.</span>
        </h1>

        {/* Description */}
        <p className="mt-8 text-base sm:text-lg lg:text-xl text-[#A5A29B] max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
          Experience the art of transforming written words into expressive, remarkably natural speech.
        </p>

        {/* Luxury CTA Controls */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
          <button
            onClick={() => onNavigate('studio')}
            className="w-full sm:w-auto btn-gold px-8 py-4 rounded-full text-xs font-bold tracking-[0.2em] inline-flex items-center justify-center gap-3 shadow-gold group"
          >
            <span>CREATE YOUR FIRST VOICE</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('voices')}
            className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase text-[#F5F1E8] bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/60 hover:bg-[#17181C] shadow-sm transition inline-flex items-center justify-center gap-2.5"
          >
            <Headphones className="w-4 h-4 text-[#C8A96B]" />
            <span>EXPLORE THE EXPERIENCE</span>
          </button>
        </div>

        {/* Visual Centerpiece: Artistic Gold Particle Waveform */}
        <div className="mt-20">
          <WaveformHero />
        </div>
      </section>

      {/* HOW IT WORKS / THE THREE MOVEMENTS */}
      <section id="experience" className="py-28 bg-[#101114] border-y border-[#302D27]/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C8A96B] mb-3">
              THE THREE MOVEMENTS
            </h2>
            <p className="font-serif text-3xl sm:text-5xl text-[#F5F1E8] font-light">
              From Manuscript to Master Recording
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/60 transition-all duration-300 shadow-luxury group">
              <div className="text-[#C8A96B] font-serif text-3xl font-light mb-6 opacity-75 group-hover:opacity-100">
                01 &mdash;
              </div>
              <h3 className="font-serif text-2xl text-[#F5F1E8] mb-3 font-normal">
                Curate the Text
              </h3>
              <p className="text-xs sm:text-sm text-[#A5A29B] leading-relaxed font-light">
                Compose inside our distraction-free editorial sanctuary or import your literary manuscript. Automated linguistic normalization polishes every syllable.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/60 transition-all duration-300 shadow-luxury group">
              <div className="text-[#C8A96B] font-serif text-3xl font-light mb-6 opacity-75 group-hover:opacity-100">
                02 &mdash;
              </div>
              <h3 className="font-serif text-2xl text-[#F5F1E8] mb-3 font-normal">
                Sculpt Tone & Cadence
              </h3>
              <p className="text-xs sm:text-sm text-[#A5A29B] leading-relaxed font-light">
                Select your vocal instrument from 50+ master voice profiles. Calibrate tempo, micro-pitch, breath stability, and emotional presence with tactile precision.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/60 transition-all duration-300 shadow-luxury group">
              <div className="text-[#C8A96B] font-serif text-3xl font-light mb-6 opacity-75 group-hover:opacity-100">
                03 &mdash;
              </div>
              <h3 className="font-serif text-2xl text-[#F5F1E8] mb-3 font-normal">
                Synthesize & Master
              </h3>
              <p className="text-xs sm:text-sm text-[#A5A29B] leading-relaxed font-light">
                Generate high-definition neural audio in seconds. Review frequency responses on a custom gold waveform and export uncompressed broadcast masters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CURATED VOICE ATELIER SECTION */}
      <section className="py-28 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 pb-6 border-b border-[#302D27]/80">
          <div>
            <h2 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C8A96B] mb-3">
              THE VOICE ATELIER
            </h2>
            <p className="font-serif text-3xl sm:text-5xl text-[#F5F1E8] font-light">
              Instruments of Pure Expression
            </p>
          </div>
          <button
            onClick={() => onNavigate('voices')}
            className="mt-6 sm:mt-0 inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-[#C8A96B] hover:text-[#E4D1A1] transition group"
          >
            <span>DISCOVER ALL 50+ VOICES</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVoices.slice(0, 4).map((voice) => (
            <div
              key={voice.id}
              className="p-6 rounded-3xl bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/60 transition-all duration-300 shadow-luxury flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <img
                    src={voice.avatar}
                    alt={voice.name}
                    className="w-13 h-13 rounded-2xl object-cover border border-[#302D27] group-hover:border-[#C8A96B]/60 transition"
                  />
                  <div>
                    <h4 className="font-serif text-xl font-medium text-[#F5F1E8] group-hover:text-[#E4D1A1] transition">
                      {voice.name}
                    </h4>
                    <span className="text-xs text-[#A5A29B] font-light">
                      {voice.language} &bull; {voice.accent}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#A5A29B] line-clamp-2 mb-5 leading-relaxed font-light">
                  {voice.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-[#090A0C] text-[#C8A96B] border border-[#302D27]">
                    {voice.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-[#090A0C] text-[#706E69] border border-[#302D27]">
                    {voice.gender}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectVoice(voice);
                  onNavigate('studio');
                }}
                className="w-full py-2.5 rounded-full text-xs font-mono tracking-[0.16em] uppercase text-[#E4D1A1] bg-[#1D1E22] border border-[#302D27] hover:border-[#C8A96B] hover:bg-[#C8A96B] hover:text-[#090A0C] font-semibold transition-all duration-300"
              >
                Audition in Studio
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* THE CRAFT & CAPABILITIES */}
      <section id="craft" className="py-28 bg-[#101114] border-t border-[#302D27]/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C8A96B] mb-3">
              PRECISION ACOUSTICS
            </h2>
            <p className="font-serif text-3xl sm:text-5xl text-[#F5F1E8] font-light">
              Crafted with Audio Engineering Rigor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {craftPrinciples.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-[#141519] border border-[#302D27] hover:border-[#C8A96B]/50 transition duration-300 shadow-luxury"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#090A0C] border border-[#302D27] text-[#C8A96B] flex items-center justify-center mb-6 shadow-inner-metal">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-[#F5F1E8] mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#A5A29B] leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GLOBAL DIALECTS */}
      <section className="py-28 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C8A96B] mb-3">
            GLOBAL RESONANCE
          </h2>
          <p className="font-serif text-3xl sm:text-5xl text-[#F5F1E8] font-light">
            World Accents & Cultural Diction
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {dialects.map((lang, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#141519] border border-[#302D27] text-center hover:border-[#C8A96B]/60 transition"
            >
              <div className="text-2xl mb-2">{lang.flag}</div>
              <div className="font-serif text-base font-normal text-[#F5F1E8] truncate">
                {lang.name}
              </div>
              <div className="text-[11px] text-[#C8A96B] font-mono mt-1">
                {lang.count}
              </div>
              <div className="text-[10px] text-[#706E69] font-light mt-1">
                {lang.locale}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES / EDITORIAL DISCIPLINES */}
      <section className="py-28 bg-[#101114] border-t border-[#302D27]/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C8A96B] mb-3">
              APPLICATIONS
            </h2>
            <p className="font-serif text-3xl sm:text-5xl text-[#F5F1E8] font-light">
              Designed for Demanding Audio Creators
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <div
                  key={i}
                  className="p-7 rounded-3xl bg-[#141519] border border-[#302D27] flex flex-col justify-between shadow-luxury hover:border-[#C8A96B]/50 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-xl bg-[#090A0C] border border-[#302D27] text-[#C8A96B] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-[#1D1E22] text-[#A5A29B] border border-[#302D27]">
                        {uc.badge}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-normal text-[#F5F1E8] mb-2.5">
                      {uc.title}
                    </h3>
                    <p className="text-xs text-[#A5A29B] font-light leading-relaxed">
                      {uc.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CURATION / EDITIONS / PRICING */}
      <section id="curation" className="py-28 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C8A96B] mb-3">
            EDITIONS & MEMBERSHIP
          </h2>
          <p className="font-serif text-3xl sm:text-5xl text-[#F5F1E8] font-light">
            Invest in Timeless Vocal Artistry
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-full bg-[#141519] border border-[#302D27] text-xs font-mono">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full transition ${
                billingCycle === 'monthly'
                  ? 'bg-[#C8A96B] text-[#090A0C] font-bold'
                  : 'text-[#A5A29B] hover:text-[#F5F1E8]'
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#C8A96B] text-[#090A0C] font-bold'
                  : 'text-[#A5A29B] hover:text-[#F5F1E8]'
              }`}
            >
              <span>ANNUAL PRIVILEGE</span>
              <span className="text-[9px] text-[#090A0C] bg-[#E4D1A1] font-bold px-1.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Edition */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#141519] border border-[#302D27] flex flex-col justify-between shadow-luxury">
            <div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-[#A5A29B] uppercase mb-3">
                FOUNDATION
              </div>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-serif text-4xl sm:text-5xl font-light text-[#F5F1E8]">$0</span>
                <span className="text-xs text-[#706E69] font-mono">/ complimentary</span>
              </div>
              <p className="text-xs text-[#A5A29B] font-light mb-8 leading-relaxed">
                Experience full studio synthesis, custom waveforms, and our complete 50+ neural voice library.
              </p>
              <ul className="space-y-3.5 text-xs text-[#A5A29B] mb-10 font-light">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Unlimited Studio Neural voice generation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>50+ High-Definition voices included</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Interactive WaveSurfer waveform player</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Standard broadcast MP3 download</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('studio')}
              className="w-full py-3.5 rounded-full text-xs font-mono tracking-[0.16em] uppercase text-[#E4D1A1] bg-[#1D1E22] border border-[#302D27] hover:border-[#C8A96B] transition font-semibold"
            >
              Enter the Studio
            </button>
          </div>

          {/* Atelier Pro (Featured Luxury) */}
          <div className="relative p-8 sm:p-10 rounded-3xl bg-[#17181C] border border-[#C8A96B] shadow-gold flex flex-col justify-between ring-1 ring-[#C8A96B]/50">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#E4D1A1] to-[#C8A96B] text-[#090A0C] text-[9.5px] font-mono font-bold tracking-[0.25em] uppercase shadow-md">
              ATELIER CHOICE
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-[#C8A96B] uppercase mb-3">
                CREATOR PRO
              </div>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-serif text-4xl sm:text-5xl font-normal text-[#F5F1E8]">
                  {billingCycle === 'monthly' ? '$24' : '$19'}
                </span>
                <span className="text-xs text-[#706E69] font-mono">/ month</span>
              </div>
              <p className="text-xs text-[#A5A29B] font-light mb-8 leading-relaxed">
                Dedicated to master authors, podcast studios, commercial agencies, and broadcast creators.
              </p>
              <ul className="space-y-3.5 text-xs text-[#F5F1E8] mb-10 font-light">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Priority Neural Rendering Pipeline</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Uncompressed 48kHz / 24-bit WAV Master Export</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Global Commercial Distribution Rights</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Long-Script Paragraph Chunking (10k+ Words)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>OpenAI & ElevenLabs API Engine Integration</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('studio')}
              className="w-full btn-gold py-3.5 rounded-full text-xs font-bold tracking-[0.18em]"
            >
              Claim Atelier Pro Edition
            </button>
          </div>

          {/* Maison Enterprise */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#141519] border border-[#302D27] flex flex-col justify-between shadow-luxury">
            <div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-[#A5A29B] uppercase mb-3">
                MAISON ENTERPRISE
              </div>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-serif text-4xl sm:text-5xl font-light text-[#F5F1E8]">
                  {billingCycle === 'monthly' ? '$89' : '$72'}
                </span>
                <span className="text-xs text-[#706E69] font-mono">/ month</span>
              </div>
              <p className="text-xs text-[#A5A29B] font-light mb-8 leading-relaxed">
                For major game studios, luxury brands, international networks, and high-volume publishers.
              </p>
              <ul className="space-y-3.5 text-xs text-[#A5A29B] mb-10 font-light">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Multi-Seat Collaborative Team Workspaces</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Private Custom Voice Cloning & Fine-Tuning</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>High-Throughput REST API & Webhooks</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                  <span>Dedicated Audio Engineer & 99.99% SLA</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('studio')}
              className="w-full py-3.5 rounded-full text-xs font-mono tracking-[0.16em] uppercase text-[#A5A29B] hover:text-[#F5F1E8] bg-[#1D1E22] border border-[#302D27] hover:border-[#C8A96B] transition font-semibold"
            >
              Inquire Privately
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#302D27]/80 bg-[#090A0C] py-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full border border-[#C8A96B]/50 flex items-center justify-center bg-[#17181C]">
              <span className="w-2 h-2 rounded-full bg-[#C8A96B]" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] text-[#F5F1E8]">VOXORA</span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#706E69] font-mono mt-0.5">
                THE ART OF GIVING WORDS A VOICE. &copy; 2026
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-8 text-xs font-mono uppercase tracking-[0.18em] text-[#A5A29B]">
            <button onClick={() => onNavigate('studio')} className="hover:text-[#E4D1A1] transition">
              Voice Studio
            </button>
            <button onClick={() => onNavigate('voices')} className="hover:text-[#E4D1A1] transition">
              Atelier
            </button>
            <button onClick={() => onNavigate('projects')} className="hover:text-[#E4D1A1] transition">
              Projects
            </button>
            <button onClick={() => onNavigate('settings')} className="hover:text-[#E4D1A1] transition">
              Preferences
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
