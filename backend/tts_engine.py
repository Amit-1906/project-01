import os
import re
import uuid
import asyncio
import httpx
from datetime import datetime
import edge_tts
import pyttsx3

# Storage directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(BASE_DIR, "storage", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

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
    
    # Split by sentence terminators
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
        # 1.0 is +0%, 1.25 is +25%, 0.8 is -20%
        pct = int(round((speed - 1.0) * 100))
        return f"+{pct}%" if pct >= 0 else f"{pct}%"

    def _format_pitch(self, pitch: float) -> str:
        # 1.0 is +0Hz, 1.1 is +10Hz, 0.9 is -10Hz
        hz = int(round((pitch - 1.0) * 100))
        return f"+{hz}Hz" if hz >= 0 else f"{hz}Hz"

    def _format_volume(self, volume: float) -> str:
        # 1.0 is +0%, 0.8 is -20%
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
        Generate speech audio and return dict with file path, url, duration, and stats.
        """
        clean_text = normalize_text(text)
        if not clean_text:
            raise ValueError("Input text cannot be empty.")

        filename = f"tts_{uuid.uuid4().hex[:12]}.{format}"
        file_path = os.path.join(AUDIO_DIR, filename)

        # 1. If OpenAI engine requested and API key provided
        if engine == "openai" and openai_key:
            try:
                # Map voice_id to OpenAI voices (alloy, echo, fable, onyx, nova, shimmer)
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
                        with open(file_path, "wb") as f:
                            f.write(resp.content)
                        duration = self._estimate_duration(clean_text, speed)
                        return {
                            "filename": filename,
                            "audio_url": f"/api/audio/{filename}",
                            "duration": duration,
                            "file_size": len(resp.content),
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
                        with open(file_path, "wb") as f:
                            f.write(resp.content)
                        duration = self._estimate_duration(clean_text, speed)
                        return {
                            "filename": filename,
                            "audio_url": f"/api/audio/{filename}",
                            "duration": duration,
                            "file_size": len(resp.content),
                            "engine": "elevenlabs",
                            "char_count": len(clean_text),
                            "word_count": len(clean_text.split())
                        }
            except Exception as e:
                print(f"ElevenLabs TTS fallback to Neural: {e}")

        # 3. Default High-Fidelity Neural TTS (Edge / Azure Neural)
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
            # 8 second timeout for edge-tts streaming
            await asyncio.wait_for(communicate.save(file_path), timeout=8.0)

            file_size = os.path.getsize(file_path)
            duration = self._estimate_duration(clean_text, speed)

            return {
                "filename": filename,
                "audio_url": f"/api/audio/{filename}",
                "duration": duration,
                "file_size": file_size,
                "engine": "neural",
                "char_count": len(clean_text),
                "word_count": len(clean_text.split())
            }
        except Exception as e:
            print(f"EdgeTTS generation notice: {e}. Falling back to local offline engine.")
            # 4. Local offline system engine fallback
            return self._fallback_pyttsx3(clean_text, filename, file_path, speed)

    def _fallback_pyttsx3(self, text: str, filename: str, file_path: str, speed: float) -> dict:
        """Fallback offline engine using local OS voice."""
        try:
            engine = pyttsx3.init()
            # Set rate (default ~200)
            engine.setProperty('rate', int(180 * speed))
            # Save to wav / file
            engine.save_to_file(text, file_path)
            engine.runAndWait()

            file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
            duration = self._estimate_duration(text, speed)
            return {
                "filename": filename,
                "audio_url": f"/api/audio/{filename}",
                "duration": duration,
                "file_size": file_size,
                "engine": "local_demo",
                "char_count": len(text),
                "word_count": len(text.split())
            }
        except Exception as ex:
            raise RuntimeError(f"All speech engines failed: {ex}")

    def _estimate_duration(self, text: str, speed: float) -> float:
        """Estimate spoken duration based on average human speech rate (~140 WPM)."""
        words = len(text.split())
        words_per_sec = (140.0 / 60.0) * max(0.2, speed)
        duration = round(words / words_per_sec, 1)
        return max(1.2, duration)

tts_manager = TTSManager()
