from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime
from uuid import UUID


# ── Request Models ──────────────────────────────────────────

class ChatInputRequest(BaseModel):
    """Input transaksi via teks chat"""
    teks: str = Field(..., min_length=1, max_length=500,
                      example="jual bakso 50 ribu")
    user_id: str


class TransaksiCreate(BaseModel):
    """Buat transaksi manual"""
    tipe: Literal["pemasukan", "pengeluaran", "piutang", "hutang"]
    jumlah: int = Field(..., gt=0)
    deskripsi: str
    kategori_id: Optional[int] = None
    nama_pihak: Optional[str] = None
    tanggal: Optional[date] = None
    catatan: Optional[str] = None


class PiutangBayarRequest(BaseModel):
    """Bayar piutang (bisa separo)"""
    piutang_id: str
    jumlah_bayar: int = Field(..., gt=0)


# ── Response Models ─────────────────────────────────────────

class AIParseResult(BaseModel):
    """Hasil parsing AI dari teks input"""
    tipe: Literal["pemasukan", "pengeluaran", "piutang", "hutang", "tidak_dikenali"]
    jumlah: Optional[int] = None
    deskripsi: str
    nama_pihak: Optional[str] = None
    kategori: Optional[str] = None
    konfirmasi_pesan: str           # pesan yang ditampilkan ke user
    perlu_konfirmasi: bool = False  # True jika AI tidak yakin


class TransaksiResponse(BaseModel):
    id: str
    tipe: str
    jumlah: int
    deskripsi: str
    deskripsi_asli: Optional[str]
    kategori_id: Optional[int]
    nama_pihak: Optional[str]
    metode_input: str
    tanggal: date
    created_at: datetime


class RingkasanHarian(BaseModel):
    tanggal: date
    total_pemasukan: int
    total_pengeluaran: int
    laba_bersih: int
    jumlah_transaksi: int
    transaksi_terbesar: Optional[dict]


class LaporanResponse(BaseModel):
    periode: str
    tanggal_mulai: date
    tanggal_selesai: date
    total_pemasukan: int
    total_pengeluaran: int
    laba_bersih: int
    margin_persen: float
    transaksi: list[dict]
    grafik_harian: list[dict]
    ai_narasi: Optional[str] = None
