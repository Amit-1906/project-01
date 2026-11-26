import os
import re
import uuid
import base64
import asyncio
import httpx
from datetime import datetime
import edge_tts

# Safe audio storage directory (resilient to serverless / read-only filesystem)
def get_audio_dir() -> str:
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        path = "/tmp/voxora_audio"
    else:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "storage", "audio")
    try:
        os.makedirs(path, exist_ok=True)
        return path
    except Exception:
        tmp_path = os.path.join(os.environ.get("TEMP", "/tmp"), "voxora_audio")
        try:
            os.makedirs(tmp_path, exist_ok=True)
            return tmp_path
        except Exception:
            return "/tmp"

AUDIO_DIR = get_audio_dir()

def normalize_text(text: str) -> str:
    """Normalize text, replace smart quotes, dashes, excessive whitespace."""
    if not text:
        return ""
    text = text.replace('“', '"').replace('”', '"')
    text = text.replace('‘', "'").replace('’', "'")
    text = text.replace('—', ' - ').replace('–', ' - ')
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def chunk_text(text: str, max_chars: int = 500) -> list[str]:
    """Break long text into coherent sentence-level chunks."""
    normalized = normalize_text(text)
    if len(normalized) <= max_chars:
        return [normalized] if normalized else []
    
    sentences = re.split(r'(?<=[.!?])\s+', normalized)
    chunks = []
    current_chunk = []
    current_length = 0
    
    for sentence in sentences:
        if current_length + len(sentence) > max_chars and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_length = len(sentence)
        else:
            current_chunk.append(sentence)
            current_length += len(sentence) + 1
            
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks

class TTSManager:
    def __init__(self):
        pass

    def _format_rate(self, speed: float) -> str:
        pct = int(round((speed - 1.0) * 100))
        return f"+{pct}%" if pct >= 0 else f"{pct}%"

    def _format_pitch(self, pitch: float) -> str:
        hz = int(round((pitch - 1.0) * 100))
        return f"+{hz}Hz" if hz >= 0 else f"{hz}Hz"

    def _format_volume(self, volume: float) -> str:
        pct = int(round((volume - 1.0) * 100))
        return f"+{pct}%" if pct >= 0 else f"{pct}%"

    async def generate_speech(
        self,
        text: str,
        voice_id: str = "en-US-JennyNeural",
        speed: float = 1.0,
        pitch: float = 1.0,
        volume: float = 1.0,
        format: str = "mp3",
        engine: str = "neural",
        openai_key: str = "",
        elevenlabs_key: str = ""
    ) -> dict:
        """
        Generate speech audio and return dict with audio data URI, duration, file size, and stats.
        Uses in-memory streaming to guarantee 100% reliable playback across both local and serverless deployments.
        """
        clean_text = normalize_text(text)
        if not clean_text:
            raise ValueError("Input text cannot be empty.")

        filename = f"tts_{uuid.uuid4().hex[:12]}.{format}"
        file_path = os.path.join(AUDIO_DIR, filename)

        # 1. If OpenAI engine requested and API key provided
        if engine == "openai" and openai_key:
            try:
                openai_voice = "alloy"
                for v in ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]:
                    if v in voice_id.lower():
                        openai_voice = v
                        break
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/audio/speech",
                        headers={
                            "Authorization": f"Bearer {openai_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "tts-1",
                            "input": clean_text,
                            "voice": openai_voice,
                            "speed": speed
                        }
                    )
                    if resp.status_code == 200:
                        audio_bytes = resp.content
                        self._safe_write_file(file_path, audio_bytes)
                        duration = self._estimate_duration(clean_text, speed)
                        b64 = base64.b64encode(audio_bytes).decode("ascii")
                        return {
                            "filename": filename,
                            "audio_url": f"data:audio/mp3;base64,{b64}",
                            "file_url": f"/api/audio/{filename}",
                            "duration": duration,
                            "file_size": len(audio_bytes),
                            "engine": "openai",
                            "char_count": len(clean_text),
                            "word_count": len(clean_text.split())
                        }
            except Exception as e:
                print(f"OpenAI TTS fallback to Neural: {e}")

        # 2. If ElevenLabs engine requested and API key provided
        if engine == "elevenlabs" and elevenlabs_key:
            try:
                eleven_voice_id = "21m00Tcm4TlvDq8ikWAM" # Rachel default
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        f"https://api.elevenlabs.io/v1/text-to-speech/{eleven_voice_id}",
                        headers={
                            "xi-api-key": elevenlabs_key,
                            "Content-Type": "application/json",
                            "Accept": "audio/mpeg"
                        },
                        json={
                            "text": clean_text,
                            "model_id": "eleven_multilingual_v2",
                            "voice_settings": {
                                "stability": 0.75,
                                "similarity_boost": 0.75
                            }
                        }
                    )
                    if resp.status_code == 200:
                        audio_bytes = resp.content
                        self._safe_write_file(file_path, audio_bytes)
                        duration = self._estimate_duration(clean_text, speed)
                        b64 = base64.b64encode(audio_bytes).decode("ascii")
                        return {
                            "filename": filename,
                            "audio_url": f"data:audio/mp3;base64,{b64}",
                            "file_url": f"/api/audio/{filename}",
                            "duration": duration,
                            "file_size": len(audio_bytes),
                            "engine": "elevenlabs",
                            "char_count": len(clean_text),
                            "word_count": len(clean_text.split())
                        }
            except Exception as e:
                print(f"ElevenLabs TTS fallback to Neural: {e}")

        # 3. Default High-Fidelity Neural TTS (Edge / Azure Neural) with streaming & automatic retry
        last_error = None
        for attempt in range(2):
            try:
                rate_str = self._format_rate(speed)
                pitch_str = self._format_pitch(pitch)
                volume_str = self._format_volume(volume)

                communicate = edge_tts.Communicate(
                    text=clean_text,
                    voice=voice_id,
                    rate=rate_str,
                    pitch=pitch_str,
                    volume=volume_str
                )

                # Stream audio chunks directly in memory (45s timeout for longer passages)
                audio_chunks = []
                async def fetch_stream():
                    async for chunk in communicate.stream():
                        if chunk["type"] == "audio":
                            audio_chunks.append(chunk["data"])

                await asyncio.wait_for(fetch_stream(), timeout=45.0)

                if not audio_chunks:
                    raise RuntimeError("No audio data received from neural speech synthesizer.")

                audio_bytes = b"".join(audio_chunks)
                self._safe_write_file(file_path, audio_bytes)

                duration = self._estimate_duration(clean_text, speed)
                b64 = base64.b64encode(audio_bytes).decode("ascii")
                data_uri = f"data:audio/mp3;base64,{b64}"

                return {
                    "filename": filename,
                    "audio_url": data_uri,
                    "file_url": f"/api/audio/{filename}",
                    "duration": duration,
                    "file_size": len(audio_bytes),
                    "engine": "neural",
                    "char_count": len(clean_text),
                    "word_count": len(clean_text.split())
                }
            except Exception as e:
                last_error = e
                print(f"EdgeTTS attempt {attempt + 1} notice: {e}")
                if attempt == 0:
                    await asyncio.sleep(0.6)

        # 4. Fallback: try pyttsx3 if installed and available (local desktop only)
        try:
            return self._fallback_pyttsx3(clean_text, filename, file_path, speed)
        except Exception:
            raise RuntimeError(f"Speech synthesis error: {last_error or 'Synthesis failed'}")

    def _safe_write_file(self, file_path: str, data: bytes):
        """Attempt to save audio to disk if writeable, without throwing on read-only environments."""
        try:
            with open(file_path, "wb") as f:
                f.write(data)
        except Exception as e:
            print(f"Notice: Storage cache write skipped ({e})")

    def _fallback_pyttsx3(self, text: str, filename: str, file_path: str, speed: float) -> dict:
        """Fallback offline engine using local OS voice (if available)."""
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.setProperty('rate', int(180 * speed))
            engine.save_to_file(text, file_path)
            engine.runAndWait()

            duration = self._estimate_duration(text, speed)
            audio_bytes = b""
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    audio_bytes = f.read()

            b64 = base64.b64encode(audio_bytes).decode("ascii") if audio_bytes else ""
            data_uri = f"data:audio/mp3;base64,{b64}" if b64 else f"/api/audio/{filename}"

            return {
                "filename": filename,
                "audio_url": data_uri,
                "file_url": f"/api/audio/{filename}",
                "duration": duration,
                "file_size": len(audio_bytes),
                "engine": "local_demo",
                "char_count": len(text),
                "word_count": len(text.split())
            }
        except Exception as ex:
            raise RuntimeError(f"Local voice engine unavailable: {ex}")

    def _estimate_duration(self, text: str, speed: float) -> float:
        """Estimate spoken duration based on average human speech rate (~140 WPM)."""
        words = len(text.split())
        words_per_sec = (140.0 / 60.0) * max(0.2, speed)
        duration = round(words / words_per_sec, 1)
        return max(1.2, duration)

tts_manager = TTSManager()
