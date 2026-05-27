'use client'
import { useState } from 'react'
import { formatRupiah } from '@/app/lib/utils'
import { bayarPiutang } from '@/app/lib/api'
import { DEMO_USER_ID } from '@/app/lib/utils'
import { Loader2, CheckCircle } from 'lucide-react'

interface Piutang {
  id: string
  nama_pelanggan: string
  jumlah_total: number
  jumlah_dibayar: number
  sisa: number
  status: string
  tanggal_bon: string
  keterangan?: string
}

export default function PiutangPanel({
  piutang, totalPiutang, loading, onRefresh
}: {
  piutang: Piutang[]
  totalPiutang: number
  loading?: boolean
  onRefresh?: () => void
}) {
  const [bayarId, setBayarId] = useState<string | null>(null)
  const [jumlahBayar, setJumlahBayar] = useState('')
  const [proses, setProses] = useState(false)

  async function handleBayar(id: string) {
    const jumlah = parseInt(jumlahBayar.replace(/\D/g, ''))
    if (!jumlah || jumlah <= 0) return

    setProses(true)
    try {
      await bayarPiutang(id, jumlah, DEMO_USER_ID)
      setBayarId(null)
      setJumlahBayar('')
      onRefresh?.()
    } catch {
      alert('Gagal proses pembayaran')
    } finally {
      setProses(false)
    }
  }

  if (loading) return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">📝 Piutang Aktif</h3>
        <span className="text-sm font-semibold text-blue-600">
          Total: {formatRupiah(totalPiutang)}
        </span>
      </div>

      {piutang.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Tidak ada piutang aktif 🎉</p>
      ) : (
        <div className="space-y-2">
          {piutang.map(p => (
            <div key={p.id} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.nama_pelanggan}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Bon: {formatRupiah(p.jumlah_total)} · Sisa: {formatRupiah(p.sisa)}
                  </p>
                  {p.jumlah_dibayar > 0 && (
                    <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${(p.jumlah_dibayar / p.jumlah_total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setBayarId(bayarId === p.id ? null : p.id)}
                  className="text-xs px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  Bayar
                </button>
              </div>

              {/* Form bayar */}
              {bayarId === p.id && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    placeholder="Jumlah bayar (Rp)"
                    value={jumlahBayar}
                    onChange={e => setJumlahBayar(e.target.value)}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    onKeyDown={e => e.key === 'Enter' && handleBayar(p.id)}
                  />
                  <button
                    onClick={() => handleBayar(p.id)}
                    disabled={proses}
                    className="px-3 py-1.5 bg-brand-500 text-white text-sm rounded-lg hover:bg-brand-600 disabled:opacity-50 flex items-center gap-1"
                  >
                    {proses ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                    Simpan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
