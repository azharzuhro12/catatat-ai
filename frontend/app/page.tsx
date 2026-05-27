'use client'
import { useState, useEffect, useCallback } from 'react'
import { getRingkasanHarian, getTransaksi, getPiutang } from '@/app/lib/api'
import { DEMO_USER_ID } from '@/app/lib/utils'
import { MetricGrid } from './components/MetricCard'
import GrafikKeuangan from './components/GrafikKeuangan'
import InsightCard from './components/InsightCard'
import ListTransaksi from './components/ListTransaksi'
import ChatInput from './components/ChatInput'
import PiutangPanel from './components/PiutangPanel'
import LaporanPanel from './components/LaporanPanel'
import { LayoutDashboard, MessageSquare, FileText, BookOpen } from 'lucide-react'

type Tab = 'dashboard' | 'catat' | 'laporan' | 'piutang'

export default function Home() {
  const [tab, setTab] = useState<Tab>('catat')
  const [ringkasan, setRingkasan] = useState<any>(null)
  const [transaksi, setTransaksi] = useState<any[]>([])
  const [piutangData, setPiutangData] = useState<any>({ piutang: [], total_piutang: 0 })
  const [loading, setLoading] = useState(true)

  const muat = useCallback(async () => {
    setLoading(true)
    try {
      const [r, t, p] = await Promise.all([
        getRingkasanHarian(DEMO_USER_ID),
        getTransaksi(DEMO_USER_ID, undefined, 10),
        getPiutang(DEMO_USER_ID),
      ])
      setRingkasan(r)
      setTransaksi(t.transaksi || [])
      setPiutangData(p)
    } catch (err) {
      console.error('Gagal muat data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { muat() }, [muat])

  const navItems = [
    { key: 'catat' as Tab, icon: MessageSquare, label: 'Catat' },
    { key: 'dashboard' as Tab, icon: LayoutDashboard, label: 'Dashboard' },
    { key: 'laporan' as Tab, icon: FileText, label: 'Laporan' },
    { key: 'piutang' as Tab, icon: BookOpen, label: 'Piutang' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">CatatAI</h1>
            <p className="text-xs text-gray-400 leading-none">Toko Pak Demo</p>
          </div>
        </div>

        {/* Quick stats di header */}
        {ringkasan && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Hari ini</p>
            <p className="text-sm font-semibold text-brand-600">
              +Rp {(ringkasan.total_pemasukan / 1000).toFixed(0)}rb
            </p>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* TAB: CATAT */}
        {tab === 'catat' && (
          <div className="p-4" style={{ height: 'calc(100vh - 128px)' }}>
            <ChatInput onTransaksiSimpan={muat} />
          </div>
        )}

        {/* TAB: DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="p-4 space-y-4">
            <MetricGrid
              pemasukan={ringkasan?.total_pemasukan || 0}
              pengeluaran={ringkasan?.total_pengeluaran || 0}
              laba={ringkasan?.laba_bersih || 0}
              perubahan={ringkasan?.perubahan_persen}
              loading={loading}
            />

            <InsightCard
              narasi={ringkasan?.ai_narasi}
              loading={loading}
              onRefresh={muat}
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-700 mb-3">Transaksi Terakhir</h2>
              <ListTransaksi transaksi={transaksi} loading={loading} />
            </div>
          </div>
        )}

        {/* TAB: LAPORAN */}
        {tab === 'laporan' && (
          <div className="p-4">
            <LaporanPanel />
          </div>
        )}

        {/* TAB: PIUTANG */}
        {tab === 'piutang' && (
          <div className="p-4">
            <PiutangPanel
              piutang={piutangData.piutang}
              totalPiutang={piutangData.total_piutang}
              loading={loading}
              onRefresh={muat}
            />
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex items-center">
        {navItems.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
              tab === key ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className={`w-5 h-5 ${tab === key && key === 'catat' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs font-medium">{label}</span>
            {tab === key && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
