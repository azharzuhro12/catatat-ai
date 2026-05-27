'use client'
import { formatRupiah, formatTanggal, warnaTipe, iconTipe } from '@/app/lib/utils'
import clsx from 'clsx'

interface Transaksi {
  id: string
  tipe: string
  jumlah: number
  deskripsi: string
  deskripsi_asli?: string
  nama_pihak?: string
  metode_input: string
  tanggal: string
  created_at: string
  kategori?: { nama: string; icon: string }
}

interface ListTransaksiProps {
  transaksi: Transaksi[]
  loading?: boolean
}

function MetodeIcon({ metode }: { metode: string }) {
  const map: Record<string, string> = { chat: '⌨️', suara: '🎤', foto: '📸' }
  return (
    <span title={`Input via ${metode}`} className="text-xs opacity-50">{map[metode] || '💳'}</span>
  )
}

export default function ListTransaksi({ transaksi, loading }: ListTransaksiProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!transaksi || transaksi.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-2xl mb-2">📭</p>
        <p className="text-sm">Belum ada transaksi. Yuk mulai catat!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transaksi.map(tx => {
        const warna = warnaTipe(tx.tipe)
        return (
          <div key={tx.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
            {/* Icon */}
            <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0', warna.bg)}>
              {tx.kategori?.icon || iconTipe(tx.tipe)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{tx.deskripsi}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={clsx('text-xs px-1.5 py-0.5 rounded-full', warna.bg, warna.text)}>
                  {tx.kategori?.nama || tx.tipe}
                </span>
                {tx.nama_pihak && (
                  <span className="text-xs text-gray-400">· {tx.nama_pihak}</span>
                )}
                <MetodeIcon metode={tx.metode_input} />
              </div>
            </div>

            {/* Jumlah + Waktu */}
            <div className="text-right flex-shrink-0">
              <p className={clsx('text-sm font-semibold', warna.text)}>
                {tx.tipe === 'pengeluaran' ? '−' : '+'}{formatRupiah(tx.jumlah)}
              </p>
              <p className="text-xs text-gray-400">{formatTanggal(tx.tanggal)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
