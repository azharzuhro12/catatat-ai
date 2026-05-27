'use client'
import { useState, useEffect } from 'react'
import { getLaporan } from '@/app/lib/api'
import { DEMO_USER_ID, formatRupiah } from '@/app/lib/utils'
import GrafikKeuangan from './GrafikKeuangan'
import InsightCard from './InsightCard'
import { FileText } from 'lucide-react'

type Periode = 'harian' | 'mingguan' | 'bulanan'

export default function LaporanPanel() {
  const [periode, setPeriode] = useState<Periode>('mingguan')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function muat() {
    setLoading(true)
    try {
      const hasil = await getLaporan(DEMO_USER_ID, periode)
      setData(hasil)
    } catch {
      console.error('Gagal muat laporan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { muat() }, [periode])

  const tabs: { key: Periode; label: string }[] = [
    { key: 'harian', label: 'Hari Ini' },
    { key: 'mingguan', label: 'Minggu Ini' },
    { key: 'bulanan', label: 'Bulan Ini' },
  ]

  return (
    <div className="space-y-4">
      {/* Tab periode */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setPeriode(t.key)}
            className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${
              periode === t.key
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {data && !loading ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs text-emerald-600 mb-1">Total Pemasukan</p>
              <p className="text-xl font-semibold text-emerald-700">{formatRupiah(data.total_pemasukan)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs text-red-600 mb-1">Total Pengeluaran</p>
              <p className="text-xl font-semibold text-red-700">{formatRupiah(data.total_pengeluaran)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Laba Bersih</p>
                  <p className={`text-2xl font-semibold ${data.laba_bersih >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                    {formatRupiah(data.laba_bersih)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Margin</p>
                  <p className="text-xl font-semibold text-gray-700">{data.margin_persen}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Transaksi</p>
                  <p className="text-xl font-semibold text-gray-700">{data.jumlah_transaksi}x</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grafik */}
          {data.grafik_harian?.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Grafik Keuangan</p>
              <GrafikKeuangan data={data.grafik_harian} />
            </div>
          )}

          {/* AI Narasi */}
          {data.ai_narasi && <InsightCard narasi={data.ai_narasi} onRefresh={muat} />}

          {/* Info periode */}
          <p className="text-xs text-gray-400 text-center">
            <FileText className="w-3 h-3 inline mr-1" />
            Periode: {data.tanggal_mulai} s/d {data.tanggal_selesai}
          </p>
        </>
      ) : (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}
    </div>
  )
}
