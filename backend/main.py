import os
import sys
import uuid
from datetime import datetime
from typing import Optional

# Ensure backend directory is in python module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from database import init_db, get_db
from voices_data import get_all_voices, get_voice_by_id
from tts_engine import tts_manager, AUDIO_DIR

app = FastAPI(
    title="VOXORA AI Voice Studio API",
    description="High-definition neural speech synthesis studio backend",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static audio files
app.mount("/api/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

# Pydantic schemas
class GenerateSpeechRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Script to synthesize")
    voice_id: str = Field("en-US-JennyNeural", description="Voice identifier")
    speed: float = Field(1.0, ge=0.25, le=2.5, description="Playback speed multiplier")
    pitch: float = Field(1.0, ge=0.5, le=1.5, description="Pitch modifier")
    volume: float = Field(1.0, ge=0.0, le=2.0, description="Volume modifier")
    stability: float = Field(0.75, ge=0.0, le=1.0, description="Voice stability/consistency")
    format: str = Field("mp3", description="Audio container format (mp3 or wav)")
    project_id: Optional[str] = None
    project_title: Optional[str] = "Untitled Script"

class PreviewSpeechRequest(BaseModel):
    voice_id: str
    text: Optional[str] = None

class ProjectCreateRequest(BaseModel):
    title: str = "Untitled Script"
    script_text: str = ""
    voice_id: str = "en-US-JennyNeural"
    voice_name: str = "Jenny"
    language: str = "en-US"
    accent: str = "American"
    speed: float = 1.0
    pitch: float = 1.0
    volume: float = 1.0
    stability: float = 0.75

class ProjectUpdateRequest(BaseModel):
    title: Optional[str] = None
    script_text: Optional[str] = None
    voice_id: Optional[str] = None
    voice_name: Optional[str] = None
    language: Optional[str] = None
    accent: Optional[str] = None
    speed: Optional[float] = None
    pitch: Optional[float] = None
    volume: Optional[float] = None
    stability: Optional[float] = None
    audio_url: Optional[str] = None
    audio_duration: Optional[float] = None

class SettingsUpdateRequest(BaseModel):
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    theme: Optional[str] = None
    default_language: Optional[str] = None
    default_voice: Optional[str] = None
    default_speed: Optional[float] = None
    default_pitch: Optional[float] = None
    audio_format: Optional[str] = None
    engine_preference: Optional[str] = None
    openai_api_key: Optional[str] = None
    elevenlabs_api_key: Optional[str] = None
    sample_rate: Optional[int] = None
    auto_normalize: Optional[int] = None
    enable_shortcuts: Optional[int] = None

@app.on_event("startup")
async def startup_event():
    init_db()
    # Pre-generate sample audio in background task if needed
    async def generate_samples():
        sample_files = [
            ("sample_launch.mp3", "Welcome to the next generation of conversational AI. Today, we are thrilled to unveil a breakthrough that redefines how machines understand human emotion, intonation, and creative context.", "en-US-JennyNeural"),
            ("sample_meditation.mp3", "Take a deep breath in through your nose... hold it gently for a moment... and slowly exhale. Release any tension in your shoulders and allow your mind to settle.", "en-US-AriaNeural"),
            ("sample_podcast.mp3", "Hello everyone and welcome back to ByteSize Future! Today we are diving into generative speech synthesis, neural vocoders, and synthetic media in 2026.", "en-US-GuyNeural")
        ]
        for fname, text, v_id in sample_files:
            fpath = os.path.join(AUDIO_DIR, fname)
            if not os.path.exists(fpath):
                try:
                    import edge_tts
                    comm = edge_tts.Communicate(text, v_id)
                    await asyncio.wait_for(comm.save(fpath), timeout=5.0)
                except Exception as e:
                    pass
    import asyncio
    asyncio.create_task(generate_samples())

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "VOXORA AI Voice Studio",
        "timestamp": datetime.utcnow().isoformat(),
        "engine": "Neural Edge / Multi-provider"
    }

# ----------------- VOICES -----------------

@app.get("/api/voices")
def get_voices(
    search: Optional[str] = None,
    language: Optional[str] = None,
    gender: Optional[str] = None,
    accent: Optional[str] = None,
    category: Optional[str] = None
):
    voices = get_all_voices()
    
    # Fetch favorite voice IDs
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT voice_id FROM favorites")
    fav_ids = set(row["voice_id"] for row in cursor.fetchall())
    conn.close()

    result = []
    for v in voices:
        v_dict = dict(v)
        v_dict["is_favorite"] = v["id"] in fav_ids
        
        # Filtering
        if search:
            query = search.lower()
            matches_search = (
                query in v["name"].lower() or
                query in v["description"].lower() or
                query in v["language"].lower() or
                query in v["accent"].lower() or
                query in v["category"].lower()
            )
            if not matches_search:
                continue
                
        if language and language != "All":
            if language not in v["language"]:
                continue
                
        if gender and gender != "All":
            if v["gender"].lower() != gender.lower():
                continue
                
        if accent and accent != "All":
            if v["accent"].lower() != accent.lower():
                continue
                
        if category and category != "All":
            if v["category"].lower() != category.lower() and category not in v.get("styles", []):
                continue
                
        result.append(v_dict)
        
    return {"voices": result, "total": len(result)}

@app.post("/api/voices/{voice_id}/favorite")
def toggle_favorite(voice_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT voice_id FROM favorites WHERE voice_id = ?", (voice_id,))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("DELETE FROM favorites WHERE voice_id = ?", (voice_id,))
        is_favorite = False
    else:
        cursor.execute("INSERT INTO favorites (voice_id, created_at) VALUES (?, ?)", 
                       (voice_id, datetime.utcnow().isoformat()))
        is_favorite = True
        
    conn.commit()
    conn.close()
    return {"voice_id": voice_id, "is_favorite": is_favorite}

# ----------------- SPEECH SYNTHESIS -----------------

@app.post("/api/tts/generate")
async def generate_speech_endpoint(req: GenerateSpeechRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    # Retrieve user settings for engine / API keys
    cursor.execute("SELECT * FROM settings WHERE id = 'default'")
    settings = cursor.fetchone()
    openai_key = settings["openai_api_key"] if settings else ""
    elevenlabs_key = settings["elevenlabs_api_key"] if settings else ""
    engine_pref = settings["engine_preference"] if settings else "neural"

    voice_meta = get_voice_by_id(req.voice_id)

    try:
        res = await tts_manager.generate_speech(
            text=req.text,
            voice_id=req.voice_id,
            speed=req.speed,
            pitch=req.pitch,
            volume=req.volume,
            format=req.format,
            engine=engine_pref,
            openai_key=openai_key,
            elevenlabs_key=elevenlabs_key
        )
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

    now = datetime.utcnow().isoformat()
    history_id = f"hist-{uuid.uuid4().hex[:8]}"
    text_snippet = (req.text[:90] + "...") if len(req.text) > 90 else req.text

    # Record into history table
    cursor.execute("""
    INSERT INTO history (id, project_id, title, text_snippet, full_text, voice_id, voice_name, language, engine, audio_url, duration, file_size, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        history_id,
        req.project_id,
        req.project_title or "Studio Generation",
        text_snippet,
        req.text,
        req.voice_id,
        voice_meta["name"],
        voice_meta["language"],
        res["engine"],
        res["audio_url"],
        res["duration"],
        res["file_size"],
        "completed",
        now
    ))

    # If linked to a project, update project record
    if req.project_id:
        cursor.execute("""
        UPDATE projects
        SET audio_url = ?, audio_duration = ?, script_text = ?, voice_id = ?, voice_name = ?,
            speed = ?, pitch = ?, volume = ?, stability = ?, char_count = ?, word_count = ?, updated_at = ?
        WHERE id = ?
        """, (
            res["audio_url"],
            res["duration"],
            req.text,
            req.voice_id,
            voice_meta["name"],
            req.speed,
            req.pitch,
            req.volume,
            req.stability,
            res["char_count"],
            res["word_count"],
            now,
            req.project_id
        ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "history_id": history_id,
        "audio_url": res["audio_url"],
        "duration": res["duration"],
        "file_size": res["file_size"],
        "engine": res["engine"],
        "voice": voice_meta,
        "char_count": res["char_count"],
        "word_count": res["word_count"]
    }

@app.post("/api/tts/preview")
async def preview_speech_endpoint(req: PreviewSpeechRequest):
    voice_meta = get_voice_by_id(req.voice_id)
    text = req.text or voice_meta.get("preview_text", "Experience lifelike voice synthesis with Voxora.")
    
    try:
        res = await tts_manager.generate_speech(
            text=text,
            voice_id=req.voice_id,
            speed=1.0,
            pitch=1.0,
            volume=1.0,
            format="mp3"
        )
        return {
            "success": True,
            "audio_url": res["audio_url"],
            "duration": res["duration"],
            "voice": voice_meta
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview generation failed: {str(e)}")

# ----------------- PROJECTS -----------------

@app.get("/api/projects")
def list_projects(search: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if search:
        query = f"%{search}%"
        cursor.execute("""
        SELECT * FROM projects WHERE title LIKE ? OR script_text LIKE ? ORDER BY updated_at DESC
        """, (query, query))
    else:
        cursor.execute("SELECT * FROM projects ORDER BY updated_at DESC")
    
    rows = cursor.fetchall()
    projects = [dict(row) for row in rows]
    conn.close()
    return {"projects": projects, "total": len(projects)}

@app.post("/api/projects")
def create_project(req: ProjectCreateRequest):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    project_id = f"proj-{uuid.uuid4().hex[:8]}"
    char_count = len(req.script_text)
    word_count = len(req.script_text.split()) if req.script_text else 0

    cursor.execute("""
    INSERT INTO projects (id, title, script_text, voice_id, voice_name, language, accent, speed, pitch, volume, stability, char_count, word_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        project_id,
        req.title,
        req.script_text,
        req.voice_id,
        req.voice_name,
        req.language,
        req.accent,
        req.speed,
        req.pitch,
        req.volume,
        req.stability,
        char_count,
        word_count,
        now,
        now
    ))
    conn.commit()
    
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    project = dict(cursor.fetchone())
    conn.close()
    return {"success": True, "project": project}

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"project": dict(row)}

@app.put("/api/projects/{project_id}")
def update_project(project_id: str, req: ProjectUpdateRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    fields = []
    values = []
    
    update_data = req.dict(exclude_unset=True)
    if "script_text" in update_data and update_data["script_text"] is not None:
        text = update_data["script_text"]
        update_data["char_count"] = len(text)
        update_data["word_count"] = len(text.split()) if text else 0

    update_data["updated_at"] = datetime.utcnow().isoformat()

    for k, v in update_data.items():
        fields.append(f"{k} = ?")
        values.append(v)

    values.append(project_id)
    query = f"UPDATE projects SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, tuple(values))
    conn.commit()

    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    updated = dict(cursor.fetchone())
    conn.close()
    return {"success": True, "project": updated}

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return {"success": True, "deleted_id": project_id}

# ----------------- HISTORY -----------------

@app.get("/api/history")
def list_history(search: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if search:
        query = f"%{search}%"
        cursor.execute("""
        SELECT * FROM history WHERE title LIKE ? OR text_snippet LIKE ? OR voice_name LIKE ?
        ORDER BY created_at DESC
        """, (query, query, query))
    else:
        cursor.execute("SELECT * FROM history ORDER BY created_at DESC")
    
    rows = cursor.fetchall()
    history = [dict(row) for row in rows]
    conn.close()
    return {"history": history, "total": len(history)}

@app.delete("/api/history/{history_id}")
def delete_history_item(history_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM history WHERE id = ?", (history_id,))
    conn.commit()
    conn.close()
    return {"success": True, "deleted_id": history_id}

@app.delete("/api/history")
def clear_all_history():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM history")
    conn.commit()
    conn.close()
    return {"success": True, "message": "Audio history cleared."}

# ----------------- SETTINGS -----------------

@app.get("/api/settings")
def get_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings WHERE id = 'default'")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"settings": {}}
    
    res = dict(row)
    # Mask API keys for security
    if res.get("openai_api_key"):
        res["openai_api_key_masked"] = res["openai_api_key"][:4] + "••••••••" + res["openai_api_key"][-4:]
    else:
        res["openai_api_key_masked"] = ""

    if res.get("elevenlabs_api_key"):
        res["elevenlabs_api_key_masked"] = res["elevenlabs_api_key"][:4] + "••••••••" + res["elevenlabs_api_key"][-4:]
    else:
        res["elevenlabs_api_key_masked"] = ""

    return {"settings": res}

@app.post("/api/settings")
def update_settings(req: SettingsUpdateRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    fields = []
    values = []
    update_data = req.dict(exclude_unset=True)

    for k, v in update_data.items():
        fields.append(f"{k} = ?")
        values.append(v)

    if fields:
        values.append("default")
        query = f"UPDATE settings SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, tuple(values))
        conn.commit()

    cursor.execute("SELECT * FROM settings WHERE id = 'default'")
    updated = dict(cursor.fetchone())
    conn.close()
    return {"success": True, "settings": updated}

# ----------------- FILE UPLOAD -----------------

@app.post("/api/upload-script")
async def upload_script(file: UploadFile = File(...)):
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only plain text (.txt) files are supported.")
    
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    return {
        "filename": file.filename,
        "text": text,
        "char_count": len(text),
        "word_count": len(text.split())
    }
