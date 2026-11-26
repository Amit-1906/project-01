import os
import sys
import uuid
from datetime import datetime
from typing import Optional

# Ensure backend directory is in python module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from database import init_db, get_db
from voices_data import get_all_voices, get_voice_by_id
from tts_engine import tts_manager, AUDIO_DIR

app = FastAPI(
    title="VOXORA AI Voice Studio API",
    description="High-definition neural speech synthesis studio backend",
    version="1.0.0"
)

# Route normalization middleware for Vercel / proxy setups
@app.middleware("http")
async def ensure_api_prefix(request: Request, call_next):
    path = request.scope.get("path", "")
    # If routed without /api prefix, prepend /api so it matches FastAPI route definitions
    if not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json"):
        request.scope["path"] = "/api" + path
    return await call_next(request)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static audio files mount
if os.path.exists(AUDIO_DIR):
    try:
        app.mount("/api/audio", StaticFiles(directory=AUDIO_DIR), name="audio")
    except Exception as e:
        print(f"Notice: static audio mount skipped ({e})")

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
    try:
        init_db()
    except Exception as e:
        print(f"Notice during DB startup: {e}")

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
    fav_ids = set()
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT voice_id FROM favorites")
        fav_ids = set(row["voice_id"] for row in cursor.fetchall())
        conn.close()
    except Exception as e:
        print(f"Notice fetching favorites: {e}")

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
    openai_key = ""
    elevenlabs_key = ""
    engine_pref = "neural"

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM settings WHERE id = 'default'")
        settings = cursor.fetchone()
        if settings:
            openai_key = settings["openai_api_key"] or ""
            elevenlabs_key = settings["elevenlabs_api_key"] or ""
            engine_pref = settings["engine_preference"] or "neural"
        conn.close()
    except Exception as e:
        print(f"Notice loading settings: {e}")

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
        raise HTTPException(status_code=500, detail=str(e))

    now = datetime.utcnow().isoformat()
    history_id = f"hist-{uuid.uuid4().hex[:8]}"
    text_snippet = (req.text[:90] + "...") if len(req.text) > 90 else req.text

    # Record into history table (isolated to prevent DB lock interrupting response)
    try:
        conn = get_db()
        cursor = conn.cursor()
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
    except Exception as db_err:
        print(f"Notice recording generation history: {db_err}")

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

# Audio download fallback endpoint
@app.get("/api/audio/{filename}")
async def get_audio_file(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join(AUDIO_DIR, safe_name)
    if os.path.exists(path):
        return FileResponse(path, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="Audio file not found")

# ----------------- PROJECTS -----------------

@app.get("/api/projects")
def get_projects(search: Optional[str] = None):
    try:
        conn = get_db()
        cursor = conn.cursor()
        if search:
            cursor.execute(
                "SELECT * FROM projects WHERE title LIKE ? OR script_text LIKE ? ORDER BY updated_at DESC",
                (f"%{search}%", f"%{search}%")
            )
        else:
            cursor.execute("SELECT * FROM projects ORDER BY updated_at DESC")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"projects": rows, "total": len(rows)}
    except Exception as e:
        return {"projects": [], "total": 0}

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

@app.post("/api/projects")
def create_project(req: ProjectCreateRequest):
    conn = get_db()
    cursor = conn.cursor()
    p_id = f"proj-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    char_count = len(req.script_text)
    word_count = len(req.script_text.split())

    cursor.execute("""
    INSERT INTO projects (id, title, script_text, voice_id, voice_name, language, accent, speed, pitch, volume, stability, char_count, word_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p_id, req.title, req.script_text, req.voice_id, req.voice_name,
        req.language, req.accent, req.speed, req.pitch, req.volume, req.stability,
        char_count, word_count, now, now
    ))
    conn.commit()

    cursor.execute("SELECT * FROM projects WHERE id = ?", (p_id,))
    new_proj = dict(cursor.fetchone())
    conn.close()
    return {"success": True, "project": new_proj}

@app.put("/api/projects/{project_id}")
def update_project(project_id: str, req: ProjectUpdateRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    updates = []
    values = []
    
    if req.title is not None:
        updates.append("title = ?")
        values.append(req.title)
    if req.script_text is not None:
        updates.append("script_text = ?")
        values.append(req.script_text)
        updates.append("char_count = ?")
        values.append(len(req.script_text))
        updates.append("word_count = ?")
        values.append(len(req.script_text.split()))
    if req.voice_id is not None:
        updates.append("voice_id = ?")
        values.append(req.voice_id)
    if req.voice_name is not None:
        updates.append("voice_name = ?")
        values.append(req.voice_name)
    if req.language is not None:
        updates.append("language = ?")
        values.append(req.language)
    if req.accent is not None:
        updates.append("accent = ?")
        values.append(req.accent)
    if req.speed is not None:
        updates.append("speed = ?")
        values.append(req.speed)
    if req.pitch is not None:
        updates.append("pitch = ?")
        values.append(req.pitch)
    if req.volume is not None:
        updates.append("volume = ?")
        values.append(req.volume)
    if req.stability is not None:
        updates.append("stability = ?")
        values.append(req.stability)
    if req.audio_url is not None:
        updates.append("audio_url = ?")
        values.append(req.audio_url)
    if req.audio_duration is not None:
        updates.append("audio_duration = ?")
        values.append(req.audio_duration)

    now = datetime.utcnow().isoformat()
    updates.append("updated_at = ?")
    values.append(now)

    values.append(project_id)
    query = f"UPDATE projects SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()

    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    updated_proj = dict(cursor.fetchone())
    conn.close()
    return {"success": True, "project": updated_proj}

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
def get_history(limit: int = 50, project_id: Optional[str] = None):
    try:
        conn = get_db()
        cursor = conn.cursor()
        if project_id:
            cursor.execute("SELECT * FROM history WHERE project_id = ? ORDER BY created_at DESC LIMIT ?", (project_id, limit))
        else:
            cursor.execute("SELECT * FROM history ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"history": rows, "total": len(rows)}
    except Exception as e:
        return {"history": [], "total": 0}

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
    return {"success": True, "message": "History cleared"}

# ----------------- SETTINGS -----------------

@app.get("/api/settings")
def get_settings():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM settings WHERE id = 'default'")
        row = cursor.fetchone()
        conn.close()
        if not row:
            return {"settings": {
                "id": "default", "user_name": "Alex Mercer", "user_email": "alex.mercer@voxora.studio",
                "theme": "dark", "default_language": "en-US", "default_voice": "en-US-JennyNeural",
                "default_speed": 1.0, "default_pitch": 1.0, "audio_format": "mp3", "engine_preference": "neural"
            }}
        return {"settings": dict(row)}
    except Exception as e:
        return {"settings": {"id": "default"}}

@app.put("/api/settings")
def update_settings(req: SettingsUpdateRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    fields = []
    values = []
    
    if req.user_name is not None:
        fields.append("user_name = ?")
        values.append(req.user_name)
    if req.user_email is not None:
        fields.append("user_email = ?")
        values.append(req.user_email)
    if req.theme is not None:
        fields.append("theme = ?")
        values.append(req.theme)
    if req.default_language is not None:
        fields.append("default_language = ?")
        values.append(req.default_language)
    if req.default_voice is not None:
        fields.append("default_voice = ?")
        values.append(req.default_voice)
    if req.default_speed is not None:
        fields.append("default_speed = ?")
        values.append(req.default_speed)
    if req.default_pitch is not None:
        fields.append("default_pitch = ?")
        values.append(req.default_pitch)
    if req.audio_format is not None:
        fields.append("audio_format = ?")
        values.append(req.audio_format)
    if req.engine_preference is not None:
        fields.append("engine_preference = ?")
        values.append(req.engine_preference)
    if req.openai_api_key is not None:
        fields.append("openai_api_key = ?")
        values.append(req.openai_api_key)
    if req.elevenlabs_api_key is not None:
        fields.append("elevenlabs_api_key = ?")
        values.append(req.elevenlabs_api_key)
    if req.sample_rate is not None:
        fields.append("sample_rate = ?")
        values.append(req.sample_rate)
    if req.auto_normalize is not None:
        fields.append("auto_normalize = ?")
        values.append(req.auto_normalize)
    if req.enable_shortcuts is not None:
        fields.append("enable_shortcuts = ?")
        values.append(req.enable_shortcuts)

    if fields:
        query = f"UPDATE settings SET {', '.join(fields)} WHERE id = 'default'"
        cursor.execute(query, values)
        conn.commit()

    cursor.execute("SELECT * FROM settings WHERE id = 'default'")
    row = dict(cursor.fetchone())
    conn.close()
    return {"success": True, "settings": row}

# ----------------- FILE IMPORT -----------------

@app.post("/api/import-text")
async def import_text(file: UploadFile = File(...)):
    filename = file.filename.lower() if file.filename else ""
    if not (filename.endswith(".txt") or filename.endswith(".md")):
        raise HTTPException(status_code=400, detail="Only .txt and .md files are supported")
    
    content_bytes = await file.read()
    try:
        text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content_bytes.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=400, detail="Unable to decode file text")

    clean = text.strip()
    return {
        "success": True,
        "filename": file.filename,
        "text": clean,
        "char_count": len(clean),
        "word_count": len(clean.split())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
