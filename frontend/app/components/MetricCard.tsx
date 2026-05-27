'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatRupiahSingkat } from '@/app/lib/utils'
import clsx from 'clsx'

interface MetricCardProps {
  label: string
  nilai: number
  perubahan?: number
  icon?: string
  warnaNilai?: 'hijau' | 'merah' | 'default'
  loading?: boolean
}

export function MetricCard({ label, nilai, perubahan, icon, warnaNilai = 'default', loading }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>

      {loading ? (
        <div className="h-7 bg-gray-100 rounded-lg animate-pulse w-24" />
      ) : (
        <div className={clsx(
          'text-2xl font-semibold',
          warnaNilai === 'hijau' && 'text-emerald-600',
          warnaNilai === 'merah' && 'text-red-600',
          warnaNilai === 'default' && 'text-gray-900',
        )}>
          Rp {formatRupiahSingkat(nilai)}
        </div>
      )}

      {perubahan !== undefined && !loading && (
        <div className={clsx(
          'flex items-center gap-1 mt-1.5 text-xs font-medium',
          perubahan > 0 ? 'text-emerald-600' : perubahan < 0 ? 'text-red-500' : 'text-gray-400'
        )}>
          {perubahan > 0 ? <TrendingUp className="w-3 h-3" /> :
           perubahan < 0 ? <TrendingDown className="w-3 h-3" /> :
           <Minus className="w-3 h-3" />}
          {perubahan > 0 ? '+' : ''}{perubahan.toFixed(1)}% vs kemarin
        </div>
      )}
    </div>
  )
}

interface MetricGridProps {
  pemasukan: number
  pengeluaran: number
  laba: number
  perubahan?: number
  loading?: boolean
}

export function MetricGrid({ pemasukan, pengeluaran, laba, perubahan, loading }: MetricGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricCard label="Pemasukan" nilai={pemasukan} icon="💰" warnaNilai="hijau" loading={loading} />
      <MetricCard label="Pengeluaran" nilai={pengeluaran} icon="🛒" warnaNilai="merah" loading={loading} />
      <MetricCard label="Laba Bersih" nilai={laba} icon="📈" warnaNilai={laba >= 0 ? 'hijau' : 'merah'} perubahan={perubahan} loading={loading} />
    </div>
  )
}
