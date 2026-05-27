import json
import re
import base64
from groq import AsyncGroq
from app.core.config import get_settings
from app.models.transaksi import AIParseResult
from app.prompts.templates import (
    PARSE_TRANSAKSI_PROMPT,
    INSIGHT_HARIAN_PROMPT,
    INSIGHT_MINGGUAN_PROMPT,
    SCAN_STRUK_PROMPT,
)

settings = get_settings()
_groq = AsyncGroq(api_key=settings.groq_api_key)
MODEL = "llama-3.3-70b-versatile"


def _clean_json(text: str) -> str:
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    return text.strip()


async def _call_ai(prompt: str, temperature: float = 0.1, max_tokens: int = 512) -> str:
    response = await _groq.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


async def parse_transaksi(input_teks: str) -> AIParseResult:
    prompt = PARSE_TRANSAKSI_PROMPT.format(input_teks=input_teks)
    try:
        raw = await _call_ai(prompt)
        data = json.loads(_clean_json(raw))
        return AIParseResult(
            tipe=data.get("tipe", "tidak_dikenali"),
            jumlah=data.get("jumlah"),
            deskripsi=data.get("deskripsi", input_teks),
            nama_pihak=data.get("nama_pihak"),
            kategori=data.get("kategori"),
            konfirmasi_pesan=data.get("konfirmasi_pesan", "Transaksi dicatat!"),
            perlu_konfirmasi=data.get("perlu_konfirmasi", False),
        )
    except Exception as e:
        print(f"AI ERROR: {type(e).__name__}: {e}")
        return AIParseResult(
            tipe="tidak_dikenali",
            deskripsi=input_teks,
            konfirmasi_pesan=f"Maaf, belum ngerti '{input_teks}'. Coba: 'jual bakso 50rb'",
            perlu_konfirmasi=True,
        )


async def generate_insight_harian(data: dict) -> str:
    prompt = INSIGHT_HARIAN_PROMPT.format(
        tanggal=data["tanggal"],
        pemasukan=data["total_pemasukan"],
        pengeluaran=data["total_pengeluaran"],
        laba=data["laba_bersih"],
        jml_transaksi=data["jumlah_transaksi"],
        perubahan_persen=data.get("perubahan_persen", 0),
        transaksi_terbesar=data.get("transaksi_terbesar", "-"),
        kategori_terlaris=data.get("kategori_terlaris", "-"),
    )
    try:
        return await _call_ai(prompt, temperature=0.7, max_tokens=256)
    except Exception:
        return "Data keuangan hari ini berhasil dicatat!"


async def generate_insight_mingguan(data: dict) -> str:
    data_harian_str = "\n".join([
        f"- {d['tanggal']}: Pemasukan {d['pemasukan']:,} | Pengeluaran {d['pengeluaran']:,}"
        for d in data.get("grafik_harian", [])
    ])
    prompt = INSIGHT_MINGGUAN_PROMPT.format(
        periode=data["periode"],
        pemasukan=data["total_pemasukan"],
        pengeluaran=data["total_pengeluaran"],
        laba=data["laba_bersih"],
        margin=data["margin_persen"],
        hari_terbaik=data.get("hari_terbaik", "-"),
        hari_terburuk=data.get("hari_terburuk", "-"),
        tren=data.get("tren", "stabil"),
        data_harian=data_harian_str,
    )
    try:
        return await _call_ai(prompt, temperature=0.7, max_tokens=300)
    except Exception:
        return "Laporan tersedia. Terus catat transaksi untuk insight lebih akurat!"


async def scan_struk(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """Scan struk pakai Groq vision (llama-4-scout mendukung gambar)."""
    try:
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        response = await _groq.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": SCAN_STRUK_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}}
                ]
            }],
            temperature=0.1,
            max_tokens=1024,
        )
        raw = _clean_json(response.choices[0].message.content)
        return json.loads(raw)
    except Exception as e:
        return {"error": f"Gagal scan struk: {str(e)}"}