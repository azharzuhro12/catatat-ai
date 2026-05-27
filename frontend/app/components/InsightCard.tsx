'use client'
import { Sparkles, RefreshCw } from 'lucide-react'

interface InsightCardProps {
  narasi?: string
  loading?: boolean
  onRefresh?: () => void
}

export default function InsightCard({ narasi, loading, onRefresh }: InsightCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-medium text-brand-700">AI Insight</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 rounded-lg hover:bg-emerald-100 transition-colors"
            title="Refresh insight"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-emerald-100 rounded animate-pulse w-full" />
          <div className="h-3 bg-emerald-100 rounded animate-pulse w-4/5" />
          <div className="h-3 bg-emerald-100 rounded animate-pulse w-3/5" />
        </div>
      ) : narasi ? (
        <p className="text-sm text-emerald-900 leading-relaxed">{narasi}</p>
      ) : (
        <p className="text-sm text-emerald-700 opacity-60">
          Tambahkan transaksi hari ini untuk mendapatkan insight dari AI.
        </p>
      )}
    </div>
  )
}
