import io
from groq import AsyncGroq
from app.core.config import get_settings

settings = get_settings()
_groq = AsyncGroq(api_key=settings.groq_api_key)


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Transkripsi audio pakai Groq Whisper — gratis!"""
    audio_file = (filename, io.BytesIO(audio_bytes), "audio/webm")

    try:
        response = await _groq.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3-turbo",
            language="id",
            prompt="Transaksi warung UMKM Indonesia: jual, beli, kulakan, bon, utang, ribu, rb.",
        )
        return response.text.strip()
    except Exception as e:
        raise RuntimeError(f"Gagal transcribe: {str(e)}")