from datetime import date, timedelta, datetime
from typing import Optional
import pytz
from app.core.database import get_supabase
from app.models.transaksi import TransaksiCreate, AIParseResult
from app.services.ai_service import (
    parse_transaksi,
    generate_insight_harian,
    generate_insight_mingguan,
)

WIB = pytz.timezone('Asia/Jakarta')

def hari_ini() -> date:
    return datetime.now(WIB).date()


async def proses_chat_input(teks: str, user_id: str) -> dict:
    hasil: AIParseResult = await parse_transaksi(teks)

    if hasil.tipe == "tidak_dikenali":
        return {
            "sukses": False,
            "pesan": hasil.konfirmasi_pesan,
            "transaksi": None,
        }

    if not hasil.perlu_konfirmasi and hasil.jumlah:
        transaksi = await simpan_transaksi(
            user_id=user_id,
            tipe=hasil.tipe,
            jumlah=hasil.jumlah,
            deskripsi=hasil.deskripsi,
            deskripsi_asli=teks,
            nama_pihak=hasil.nama_pihak,
            metode_input="chat",
        )

        if hasil.tipe == "piutang" and hasil.nama_pihak:
            await simpan_piutang(
                user_id=user_id,
                transaksi_id=transaksi["id"],
                nama_pelanggan=hasil.nama_pihak,
                jumlah_total=hasil.jumlah or 0,
            )

        return {
            "sukses": True,
            "pesan": hasil.konfirmasi_pesan,
            "transaksi": transaksi,
        }

    return {
        "sukses": False,
        "pesan": hasil.konfirmasi_pesan,
        "draft": hasil.model_dump(),
        "perlu_konfirmasi": True,
    }


async def simpan_transaksi(
    user_id: str,
    tipe: str,
    jumlah: int,
    deskripsi: str,
    deskripsi_asli: Optional[str] = None,
    kategori_id: Optional[int] = None,
    nama_pihak: Optional[str] = None,
    metode_input: str = "chat",
    tanggal: Optional[date] = None,
    catatan: Optional[str] = None,
) -> dict:
    db = get_supabase()
    payload = {
        "user_id": user_id,
        "tipe": tipe,
        "jumlah": jumlah,
        "deskripsi": deskripsi,
        "deskripsi_asli": deskripsi_asli,
        "kategori_id": kategori_id,
        "nama_pihak": nama_pihak,
        "metode_input": metode_input,
        "tanggal": str(tanggal or hari_ini()),
        "catatan": catatan,
        "sudah_lunas": tipe not in ("piutang", "hutang"),
    }
    result = db.table("transaksi").insert(payload).execute()
    return result.data[0]


async def simpan_piutang(
    user_id: str,
    transaksi_id: str,
    nama_pelanggan: str,
    jumlah_total: int,
) -> dict:
    db = get_supabase()
    result = db.table("piutang").insert({
        "user_id": user_id,
        "transaksi_id": transaksi_id,
        "nama_pelanggan": nama_pelanggan,
        "jumlah_total": jumlah_total,
        "status": "belum_lunas",
    }).execute()
    return result.data[0]


async def get_transaksi_user(user_id: str, tanggal: Optional[date] = None, limit: int = 20) -> list:
    db = get_supabase()
    q = db.table("transaksi").select("*, kategori(nama, icon)") \
        .eq("user_id", user_id).order("created_at", desc=True).limit(limit)
    if tanggal:
        q = q.eq("tanggal", str(tanggal))
    result = q.execute()
    return result.data


async def get_ringkasan_harian(user_id: str, tanggal: Optional[date] = None) -> dict:
    tgl = tanggal or hari_ini()
    transaksi = await get_transaksi_user(user_id, tanggal=tgl, limit=100)

    pemasukan = sum(t["jumlah"] for t in transaksi if t["tipe"] == "pemasukan")
    pengeluaran = sum(t["jumlah"] for t in transaksi if t["tipe"] == "pengeluaran")
    laba = pemasukan - pengeluaran

    kemarin = tgl - timedelta(days=1)
    transaksi_kemarin = await get_transaksi_user(user_id, tanggal=kemarin, limit=100)
    pemasukan_kemarin = sum(t["jumlah"] for t in transaksi_kemarin if t["tipe"] == "pemasukan")
    perubahan = ((pemasukan - pemasukan_kemarin) / pemasukan_kemarin * 100) if pemasukan_kemarin else 0

    transaksi_terbesar = max(transaksi, key=lambda t: t["jumlah"], default=None)

    data = {
        "tanggal": str(tgl),
        "total_pemasukan": pemasukan,
        "total_pengeluaran": pengeluaran,
        "laba_bersih": laba,
        "jumlah_transaksi": len(transaksi),
        "perubahan_persen": perubahan,
        "transaksi_terbesar": transaksi_terbesar["deskripsi"] if transaksi_terbesar else "-",
        "kategori_terlaris": "-",
    }

    data["ai_narasi"] = await generate_insight_harian(data)
    data["transaksi"] = transaksi
    return data


async def get_laporan(user_id: str, periode: str = "mingguan") -> dict:
    tgl_hari_ini = hari_ini()

    if periode == "harian":
        mulai = tgl_hari_ini
        selesai = tgl_hari_ini
    elif periode == "mingguan":
        mulai = tgl_hari_ini - timedelta(days=6)
        selesai = tgl_hari_ini
    else:
        mulai = tgl_hari_ini.replace(day=1)
        selesai = tgl_hari_ini

    db = get_supabase()
    result = db.table("transaksi").select("*") \
        .eq("user_id", user_id) \
        .gte("tanggal", str(mulai)) \
        .lte("tanggal", str(selesai)) \
        .order("tanggal", desc=False) \
        .execute()

    transaksi = result.data
    pemasukan = sum(t["jumlah"] for t in transaksi if t["tipe"] == "pemasukan")
    pengeluaran = sum(t["jumlah"] for t in transaksi if t["tipe"] == "pengeluaran")
    laba = pemasukan - pengeluaran
    margin = (laba / pemasukan * 100) if pemasukan else 0

    grafik = {}
    for t in transaksi:
        tgl = t["tanggal"]
        if tgl not in grafik:
            grafik[tgl] = {"tanggal": tgl, "pemasukan": 0, "pengeluaran": 0}
        if t["tipe"] == "pemasukan":
            grafik[tgl]["pemasukan"] += t["jumlah"]
        elif t["tipe"] == "pengeluaran":
            grafik[tgl]["pengeluaran"] += t["jumlah"]

    grafik_list = sorted(grafik.values(), key=lambda x: x["tanggal"])

    if grafik_list:
        hari_terbaik = max(grafik_list, key=lambda x: x["pemasukan"])["tanggal"]
        hari_terburuk = min(grafik_list, key=lambda x: x["pemasukan"])["tanggal"]
    else:
        hari_terbaik = hari_terburuk = "-"

    data = {
        "periode": periode,
        "periode_label": f"{mulai} s/d {selesai}",
        "tanggal_mulai": str(mulai),
        "tanggal_selesai": str(selesai),
        "total_pemasukan": pemasukan,
        "total_pengeluaran": pengeluaran,
        "laba_bersih": laba,
        "margin_persen": round(margin, 1),
        "jumlah_transaksi": len(transaksi),
        "hari_terbaik": hari_terbaik,
        "hari_terburuk": hari_terburuk,
        "tren": "naik" if laba > 0 else "turun",
        "grafik_harian": grafik_list,
        "transaksi": transaksi,
    }

    if periode in ("mingguan", "bulanan"):
        data["ai_narasi"] = await generate_insight_mingguan(data)

    return data


async def get_piutang_aktif(user_id: str) -> list:
    db = get_supabase()
    result = db.table("piutang").select("*") \
        .eq("user_id", user_id) \
        .neq("status", "lunas") \
        .order("tanggal_bon", desc=True) \
        .execute()
    return result.data


async def bayar_piutang(piutang_id: str, jumlah_bayar: int, user_id: str) -> dict:
    db = get_supabase()
    p = db.table("piutang").select("*").eq("id", piutang_id).eq("user_id", user_id).single().execute()
    data = p.data

    baru_dibayar = data["jumlah_dibayar"] + jumlah_bayar
    status = "lunas" if baru_dibayar >= data["jumlah_total"] else "sebagian"

    db.table("piutang").update({
        "jumlah_dibayar": baru_dibayar,
        "status": status,
    }).eq("id", piutang_id).execute()

    await simpan_transaksi(
        user_id=user_id,
        tipe="pemasukan",
        jumlah=jumlah_bayar,
        deskripsi=f"Bayar piutang - {data['nama_pelanggan']}",
        nama_pihak=data["nama_pelanggan"],
        metode_input="chat",
    )

    return {"status": status, "sisa": data["jumlah_total"] - baru_dibayar}