import sqlite3
import os
import json
from datetime import datetime

def get_db_path() -> str:
    """Return an accessible database file path, falling back to /tmp on serverless/read-only systems."""
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return "/tmp/voxora.db"
    local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voxora.db")
    try:
        # Check if local directory is writeable
        test_file = os.path.join(os.path.dirname(local_path), ".test_db_write")
        with open(test_file, "w") as f:
            f.write("1")
        if os.path.exists(test_file):
            os.remove(test_file)
        return local_path
    except Exception:
        tmp_dir = os.environ.get("TMPDIR", os.environ.get("TEMP", "/tmp"))
        return os.path.join(tmp_dir, "voxora.db")

DB_PATH = get_db_path()

def get_db():
    conn = sqlite3.connect(get_db_path(), timeout=15.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Projects table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            script_text TEXT DEFAULT '',
            voice_id TEXT NOT NULL,
            voice_name TEXT NOT NULL,
            language TEXT DEFAULT 'en-US',
            accent TEXT DEFAULT 'American',
            speed REAL DEFAULT 1.0,
            pitch REAL DEFAULT 1.0,
            volume REAL DEFAULT 1.0,
            stability REAL DEFAULT 0.75,
            audio_url TEXT,
            audio_duration REAL DEFAULT 0.0,
            char_count INTEGER DEFAULT 0,
            word_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)
        
        # History table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            title TEXT NOT NULL,
            text_snippet TEXT NOT NULL,
            full_text TEXT,
            voice_id TEXT NOT NULL,
            voice_name TEXT NOT NULL,
            language TEXT DEFAULT 'en-US',
            engine TEXT DEFAULT 'neural',
            audio_url TEXT NOT NULL,
            duration REAL DEFAULT 0.0,
            file_size INTEGER DEFAULT 0,
            status TEXT DEFAULT 'completed',
            created_at TEXT NOT NULL
        )
        """)
        
        # Settings table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            user_name TEXT DEFAULT 'Alex Mercer',
            user_email TEXT DEFAULT 'alex.mercer@voxora.studio',
            theme TEXT DEFAULT 'light',
            default_language TEXT DEFAULT 'en-US',
            default_voice TEXT DEFAULT 'en-US-JennyNeural',
            default_speed REAL DEFAULT 1.0,
            default_pitch REAL DEFAULT 1.0,
            audio_format TEXT DEFAULT 'mp3',
            engine_preference TEXT DEFAULT 'neural',
            openai_api_key TEXT DEFAULT '',
            elevenlabs_api_key TEXT DEFAULT '',
            sample_rate INTEGER DEFAULT 44100,
            auto_normalize INTEGER DEFAULT 1,
            enable_shortcuts INTEGER DEFAULT 1
        )
        """)
        
        # Favorites table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS favorites (
            voice_id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL
        )
        """)
        
        # Ensure default settings row exists
        cursor.execute("SELECT id FROM settings WHERE id = 'default'")
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO settings (id, user_name, user_email, theme, default_language, default_voice, default_speed, default_pitch, audio_format, engine_preference)
            VALUES ('default', 'Alex Mercer', 'alex.mercer@voxora.studio', 'light', 'en-US', 'en-US-JennyNeural', 1.0, 1.0, 'mp3', 'neural')
            """)

        # Seed sample projects if empty
        cursor.execute("SELECT COUNT(*) FROM projects")
        count = cursor.fetchone()[0]
        if count == 0:
            now = datetime.utcnow().isoformat()
            sample_projects = [
                (
                    'proj-01',
                    'Product Launch Announcement 2026',
                    'Welcome to the next generation of conversational AI. Today, we are thrilled to unveil a breakthrough that redefines how machines understand human emotion, intonation, and creative context. Built with unparalleled precision, every nuance in voice inflection brings your stories vividly to life.',
                    'en-US-JennyNeural',
                    'Jenny (Studio Pro)',
                    'en-US',
                    'American',
                    1.0,
                    1.0,
                    1.0,
                    0.8,
                    '/api/audio/sample_launch.mp3',
                    14.2,
                    298,
                    46,
                    now,
                    now
                ),
                (
                    'proj-02',
                    'Mindfulness & Breathing Meditation',
                    'Take a deep breath in through your nose... hold it gently for a moment... and slowly exhale. Release any tension in your shoulders and allow your mind to settle into this peaceful, tranquil stillness. You are calm, centered, and fully present.',
                    'en-US-AriaNeural',
                    'Aria (Warm & Calm)',
                    'en-US',
                    'American',
                    0.9,
                    0.95,
                    1.0,
                    0.9,
                    '/api/audio/sample_meditation.mp3',
                    16.8,
                    242,
                    41,
                    now,
                    now
                ),
                (
                    'proj-03',
                    'Tech Podcast Introduction - Ep 42',
                    'Hello everyone and welcome back to ByteSize Future! Today we are diving into generative speech synthesis, neural vocoders, and what the future of synthetic media looks like in 2026. Grab your headphones and let us dive straight in.',
                    'en-US-GuyNeural',
                    'Guy (Podcast Host)',
                    'en-US',
                    'American',
                    1.05,
                    1.0,
                    1.0,
                    0.75,
                    '/api/audio/sample_podcast.mp3',
                    12.4,
                    236,
                    38,
                    now,
                    now
                )
            ]
            cursor.executemany("""
            INSERT INTO projects (id, title, script_text, voice_id, voice_name, language, accent, speed, pitch, volume, stability, audio_url, audio_duration, char_count, word_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, sample_projects)

            # Seed initial history items
            sample_history = [
                (
                    'hist-01',
                    'proj-01',
                    'Product Launch Announcement 2026',
                    'Welcome to the next generation of conversational AI. Today, we are thrilled to unveil...',
                    'Welcome to the next generation of conversational AI. Today, we are thrilled to unveil a breakthrough that redefines how machines understand human emotion, intonation, and creative context.',
                    'en-US-JennyNeural',
                    'Jenny (Studio Pro)',
                    'en-US',
                    'neural',
                    '/api/audio/sample_launch.mp3',
                    14.2,
                    228000,
                    'completed',
                    now
                ),
                (
                    'hist-02',
                    'proj-02',
                    'Mindfulness & Breathing Meditation',
                    'Take a deep breath in through your nose... hold it gently for a moment...',
                    'Take a deep breath in through your nose... hold it gently for a moment... and slowly exhale. Release any tension in your shoulders and allow your mind to settle.',
                    'en-US-AriaNeural',
                    'Aria (Warm & Calm)',
                    'en-US',
                    'neural',
                    '/api/audio/sample_meditation.mp3',
                    16.8,
                    269000,
                    'completed',
                    now
                )
            ]
            cursor.executemany("""
            INSERT INTO history (id, project_id, title, text_snippet, full_text, voice_id, voice_name, language, engine, audio_url, duration, file_size, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, sample_history)

        # Seed default favorites
        cursor.execute("SELECT COUNT(*) FROM favorites")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("INSERT INTO favorites (voice_id, created_at) VALUES (?, ?)", [
                ('en-US-JennyNeural', datetime.utcnow().isoformat()),
                ('en-US-GuyNeural', datetime.utcnow().isoformat()),
                ('en-GB-SoniaNeural', datetime.utcnow().isoformat()),
                ('en-US-ChristopherNeural', datetime.utcnow().isoformat()),
            ])
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Warning initializing database: {e}")

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", get_db_path())
