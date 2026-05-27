from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.transaksi import ChatInputRequest, PiutangBayarRequest
from app.services.transaksi_service import (
    proses_chat_input,
    simpan_transaksi,
    get_transaksi_user,
    get_ringkasan_harian,
    get_laporan,
    get_piutang_aktif,
    bayar_piutang,
)
from app.services.speech_service import transcribe_audio
from app.services.ai_service import scan_struk
from datetime import date
from typing import Optional

router = APIRouter(prefix="/transaksi", tags=["Transaksi"])


@router.post("/chat")
async def input_via_chat(body: ChatInputRequest):
    """
    Input transaksi dari teks chat.
    Contoh: {"teks": "jual bakso 50rb", "user_id": "uuid..."}
    """
    hasil = await proses_chat_input(body.teks, body.user_id)
    return hasil


@router.post("/suara")
async def input_via_suara(
    audio: UploadFile = File(...),
    user_id: str = Form(...),
):
    """
    Input transaksi dari rekaman suara.
    Audio akan di-transcribe dulu, lalu diparse AI.
    """
    if not audio.content_type.startswith("audio/"):
        raise HTTPException(400, "File harus berupa audio (webm, mp3, wav, dll)")

    audio_bytes = await audio.read()
    
    # 1. Speech → Text
    teks = await transcribe_audio(audio_bytes, filename=audio.filename or "audio.webm")

    if not teks:
        raise HTTPException(422, "Suara tidak terdengar, coba rekam ulang")

    # 2. Text → AI Parse → Simpan (sama seperti chat)
    hasil = await proses_chat_input(teks, user_id)
    hasil["teks_transkripsi"] = teks  # tambahkan info transkripsi
    return hasil


@router.post("/scan-struk")
async def input_via_scan(
    foto: UploadFile = File(...),
    user_id: str = Form(...),
):
    """
    Scan foto struk/nota → auto-input transaksi.
    Menggunakan Gemini Vision.
    """
    if not foto.content_type.startswith("image/"):
        raise HTTPException(400, "File harus berupa gambar (jpg, png, dll)")

    image_bytes = await foto.read()
    hasil_scan = await scan_struk(image_bytes, foto.content_type)

    if "error" in hasil_scan:
        raise HTTPException(422, hasil_scan["error"])

    # Simpan transaksi dari scan struk
    if hasil_scan.get("total") and hasil_scan.get("total") > 0:
        items_str = ", ".join([i["nama"] for i in hasil_scan.get("items", [])])
        transaksi = await simpan_transaksi(
            user_id=user_id,
            tipe="pengeluaran",
            jumlah=hasil_scan["total"],
            deskripsi=f"Belanja: {items_str}" if items_str else "Pembelian dari struk",
            metode_input="foto",
        )
        return {
            "sukses": True,
            "pesan": f"✅ Struk berhasil discan! Total Rp {hasil_scan['total']:,}",
            "transaksi": transaksi,
            "detail_scan": hasil_scan,
        }

    return {"sukses": False, "pesan": "Tidak bisa membaca total dari struk", "detail_scan": hasil_scan}


@router.get("/list")
async def list_transaksi(user_id: str, tanggal: Optional[date] = None, limit: int = 20):
    """Ambil daftar transaksi user."""
    data = await get_transaksi_user(user_id, tanggal, limit)
    return {"transaksi": data, "total": len(data)}


@router.get("/ringkasan-harian")
async def ringkasan_harian(user_id: str, tanggal: Optional[date] = None):
    """Ringkasan + AI insight harian."""
    return await get_ringkasan_harian(user_id, tanggal)


@router.get("/laporan")
async def laporan(user_id: str, periode: str = "mingguan"):
    """
    Laporan keuangan dengan AI narasi.
    periode: harian | mingguan | bulanan
    """
    if periode not in ("harian", "mingguan", "bulanan"):
        raise HTTPException(400, "periode harus: harian, mingguan, atau bulanan")
    return await get_laporan(user_id, periode)


@router.get("/piutang")
async def piutang_aktif(user_id: str):
    """Daftar piutang (bon) yang belum lunas."""
    data = await get_piutang_aktif(user_id)
    total_piutang = sum(p["sisa"] for p in data)
    return {"piutang": data, "total_piutang": total_piutang}


@router.post("/piutang/bayar")
async def bayar(body: PiutangBayarRequest, user_id: str):
    """Proses pembayaran piutang (bisa sebagian)."""
    hasil = await bayar_piutang(body.piutang_id, body.jumlah_bayar, user_id)
    return {
        "sukses": True,
        "pesan": f"✅ Pembayaran Rp {body.jumlah_bayar:,} dicatat. Status: {hasil['status']}",
        **hasil,
    }
