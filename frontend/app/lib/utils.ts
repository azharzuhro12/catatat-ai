// Format rupiah: 50000 → "Rp 50.000"
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

// Format singkat: 50000 → "50rb", 1500000 → "1,5jt"
export function formatRupiahSingkat(angka: number): string {
  if (angka >= 1_000_000) return `${(angka / 1_000_000).toFixed(1).replace('.0', '')}jt`
  if (angka >= 1_000) return `${(angka / 1_000).toFixed(0)}rb`
  return `${angka}`
}

// Format tanggal: "2024-06-10" → "Senin, 10 Jun"
export function formatTanggal(tgl: string): string {
  return new Date(tgl).toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

// Warna berdasarkan tipe transaksi
export function warnaTipe(tipe: string) {
  switch (tipe) {
    case 'pemasukan': return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    case 'pengeluaran': return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
    case 'piutang': return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' }
    case 'hutang': return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
    default: return { text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' }
  }
}

// Icon per tipe
export function iconTipe(tipe: string): string {
  switch (tipe) {
    case 'pemasukan': return '💰'
    case 'pengeluaran': return '🛒'
    case 'piutang': return '📝'
    case 'hutang': return '📤'
    default: return '💳'
  }
}

// Demo user_id untuk development (hapus saat production)
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
