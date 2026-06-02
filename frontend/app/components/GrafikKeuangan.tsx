'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import { formatRupiahSingkat, formatTanggal } from '@/app/lib/utils'

interface GrafikData {
  tanggal: string
  pemasukan: number
  pengeluaran: number
}

interface GrafikKeuanganProps {
  data: GrafikData[]
  loading?: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{formatTanggal(label)}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="text-xs">
          {p.name}: Rp {p.value.toLocaleString('id-ID')}
        </p>
      ))}
      {payload.length === 2 && (
        <p className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-100">
          Laba: Rp {(payload[0].value - payload[1].value).toLocaleString('id-ID')}
        </p>
      )}
    </div>
  )
}

export default function GrafikKeuangan({ data, loading }: GrafikKeuanganProps) {
  if (loading) {
    return (
      <div className="h-48 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-400 text-sm">Memuat grafik...</span>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center">
        <p className="text-gray-400 text-sm">Belum ada data transaksi</p>
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    name: new Date(d.tanggal).toLocaleDateString('id-ID', { month: 'long' }),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barGap={2} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tickFormatter={v => formatRupiahSingkat(v)}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false} tickLine={false} width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(val) => val === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
        />
        <Bar dataKey="pemasukan" fill="#1D9E75" radius={[4, 4, 0, 0]} name="pemasukan" />
        <Bar dataKey="pengeluaran" fill="#F87171" radius={[4, 4, 0, 0]} name="pengeluaran" />
      </BarChart>
    </ResponsiveContainer>
  )
}
