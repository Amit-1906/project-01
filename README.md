# VOXORA — Premium AI Text-to-Speech Studio

> **Transform any text into expressive, natural-sounding speech with AI.**

VOXORA is a production-quality, commercial-grade AI Voice Studio application designed with an aesthetic inspired by **Apple**, **Linear**, and **ElevenLabs**. It combines an expressive neural voice engine with a modern 3-column workspace, interactive WaveSurfer.js waveform visualizer, full project management, audio history log, and customizable provider engines.

---

## 🌟 Key Features

### 1. Landing Page (`/`)
- **Hero Section**: "Give Your Words a Voice." with headline, subtitle, and primary/secondary CTAs.
- **Interactive Audio Waveform Visualizer**: Live HTML5 canvas frequency visualizer synced with playable neural voice previews.
- **Voice Sample Chips**: Instant 1-click preview of top studio voices (Jenny, Sonia, Christopher, Aria).
- **How It Works**: 3-step walkthrough from script input to cadence fine-tuning and studio export.
- **Featured Voices & Capabilities**: Overview of paragraph chunking, 40+ languages, and broadcast-grade MP3/WAV outputs.
- **Global Accents**: Filterable language distribution showcase.
- **Use Cases**: Tailored solutions for Podcasters, Audiobooks, Video Creators, and Game Devs.
- **Pricing**: Transparent tiers (Starter, Creator Pro, Enterprise Studio) with Annual billing toggle (20% discount).

### 2. AI Voice Studio (`/studio`) — Flagship 3-Column Workspace
- **Top Header**: Project name inline editing, Cloud Saved status, "Save Project" button, and glowing "Generate Speech" action.
- **Center Editor**:
  - Distraction-free, responsive script editor.
  - Live character, word, and paragraph chunk counters.
  - Preset scripts: *Product Launch*, *Mindfulness & Meditation*, *Tech Podcast*, and *Historical Documentary*.
  - Plain text file import (`.txt`).
  - Text normalization and automatic punctuation handling.
- **Voice & Nuance Controls Panel**:
  - Voice model dropdown picker with avatars and category tags.
  - Gender quick filter (All / Female / Male).
  - Speaking Speed slider (0.5x to 2.0x).
  - Pitch Modulator (-20% to +20%).
  - Stability & Nuance slider (ElevenLabs-style 0.0 to 1.0).
  - Volume booster slider (20% to 150%).
  - Quick voice sample preview button.
- **Interactive Audio Player**:
  - Powered by **WaveSurfer.js** with interactive audio seeking.
  - Play/Pause toggle with duration timestamp (`00:05 / 00:14`).
  - Playback speed multiplier (0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
  - Audio volume slider & mute toggle.
  - Format selector (MP3 320kbps vs WAV Lossless 48kHz).
  - Direct audio download and 1-click regeneration.
- **Right Inspector Panel**:
  - Detailed Voice Profile card (actor photo, language, accent, description, tags).
  - Generation settings summary.
  - Recent generations list with 1-click replay and editor loading.
  - Studio voiceover tips.

### 3. Voice Library (`/voices`)
- Catalog of 50+ diverse, realistic AI voices across **8 categories**:
  *Professional*, *Conversational*, *Narration*, *Storytelling*, *News*, *Educational*, *Energetic*, *Calm*.
- Search voices by name, accent, language, style, or keywords.
- Filter by Gender, Language, and category tabs.
- "Favorites" filter system with persistence.
- Live sample player on every voice card.
- "Select Voice" button that directly loads the voice into the Studio.

### 4. My Projects (`/projects`)
- Persistent project storage with title, script, selected voice, audio duration, and word count.
- Search and sorting (by recently updated, date created, or alphabetical).
- Inline project renaming modal.
- Project deletion with confirmation modal.
- 1-click audio download from project cards.
- "Open in Studio" action that resumes project sessions.

### 5. Audio History (`/history`)
- Chronological timeline of all synthesized speech generations.
- Search generations by title, snippet, or voice name.
- Inline audio player with play/pause.
- Direct MP3 download.
- Reopen any historical generation text back into the Studio.
- Delete individual items or Clear All history with confirmation.

### 6. Settings & Multi-Provider Engine (`/settings`)
- User Profile management (Name, Email, Plan Tier).
- Theme toggle: **Light Mode** (default off-white & deep navy) and **Dark Mode**.
- Default voice, language, and speed preferences.
- Audio container preference (MP3 vs WAV).
- Multi-Engine Architecture:
  1. **Neural Studio Engine (Default & Included Free)**: 400+ Microsoft Azure neural broadcast voices. Ultra-realistic human emotion, pitch, rate, and volume controls with zero API keys required.
  2. **OpenAI Text-to-Speech**: Connect your OpenAI API key for `tts-1` / `tts-1-hd` (alloy, echo, nova, fable, onyx, shimmer).
  3. **ElevenLabs**: Connect your ElevenLabs API key for multilingual v2 and turbo synthesis.
  4. **Local System / Browser Speech**: Offline fallback mode.
- Secure API key storage and masking.

### 7. Studio Guide & Help Modal
- Punctuation nuance tips (how commas, periods, ellipses, and hyphens shape prosody).
- Keyboard shortcuts (`Ctrl + Enter`, `Ctrl + S`, `Space`, etc.).
- Commercial rights and broadcast audio specifications.

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 18 / 19 with TypeScript
  - Tailwind CSS with custom electric violet (`#7C3AED`) & deep navy (`#0B132B`) palette
  - Lucide Icons
  - WaveSurfer.js (neural waveform visualization)
  - Vite dev server with `/api` proxy
- **Backend**:
  - Python FastAPI (Asynchronous REST API)
  - Uvicorn ASGI server
  - SQLite database (`backend/voxora.db`) with auto-migrations
  - `edge-tts` (Microsoft Azure Neural Voice integration)
  - `pyttsx3` (Offline local fallback engine)
  - HTTPX async client (OpenAI & ElevenLabs adapters)

---

## 🚀 Running the Application

Both servers are currently running and listening on local ports:
- **Frontend**: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **Backend API**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

To manually start the servers from scratch:

```bash
# Terminal 1: Backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

