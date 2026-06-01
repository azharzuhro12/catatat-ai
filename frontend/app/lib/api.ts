import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  }
})

// ── Transaksi ────────────────────────────────────────────────

export async function kirimChat(teks: string, userId: string) {
  const res = await api.post('/transaksi/chat', { teks, user_id: userId })
  return res.data
}

export async function kirimSuara(audioBlob: Blob, userId: string) {
  const form = new FormData()
  form.append('audio', audioBlob, 'rekaman.webm')
  form.append('user_id', userId)
  const res = await api.post('/transaksi/suara', form, {
    headers: { 'Content-Type': 'multipart/form-data', 'ngrok-skip-browser-warning': 'true' },
  })
  return res.data
}

export async function kirimStruk(file: File, userId: string) {
  const form = new FormData()
  form.append('foto', file)
  form.append('user_id', userId)
  const res = await api.post('/transaksi/scan-struk', form, {
    headers: { 'Content-Type': 'multipart/form-data', 'ngrok-skip-browser-warning': 'true' },
  })
  return res.data
}

export async function getTransaksi(userId: string, tanggal?: string, limit = 20) {
  const res = await api.get('/transaksi/list', {
    params: { user_id: userId, tanggal, limit },
  })
  return res.data
}

export async function getRingkasanHarian(userId: string, tanggal?: string) {
  const res = await api.get('/transaksi/ringkasan-harian', {
    params: { user_id: userId, tanggal },
  })
  return res.data
}

export async function getLaporan(userId: string, periode: 'harian' | 'mingguan' | 'bulanan') {
  const res = await api.get('/transaksi/laporan', {
    params: { user_id: userId, periode },
  })
  return res.data
}

export async function getPiutang(userId: string) {
  const res = await api.get('/transaksi/piutang', { params: { user_id: userId } })
  return res.data
}

export async function bayarPiutang(piutangId: string, jumlahBayar: number, userId: string) {
  const res = await api.post('/transaksi/piutang/bayar', {
    piutang_id: piutangId,
    jumlah_bayar: jumlahBayar,
  }, { params: { user_id: userId } })
  return res.data
}