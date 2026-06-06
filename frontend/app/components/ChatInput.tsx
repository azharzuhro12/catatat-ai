'use client'
import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, Camera, Loader2 } from 'lucide-react'
import { kirimChat, kirimSuara, kirimStruk } from '@/app/lib/api'
import { useVoiceRecorder } from '@/app/hooks/useVoiceRecorder'
import { DEMO_USER_ID } from '@/app/lib/utils'
import clsx from 'clsx'

interface Message {
  id: string
  dari: 'user' | 'ai'
  teks: string
  waktu: Date
  sukses?: boolean
}

export default function ChatInput({ onTransaksiSimpan }: { onTransaksiSimpan?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      dari: 'ai',
      teks: '👋 Halo! Saya CatatAI. Ketik transaksi kamu pakai bahasa sehari-hari ya!\n\nContoh:\n• "jual bakso 15rb"\n• "kulakan daging 120rb"\n• "utang galon bu Eni 12rb"',
      waktu: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isRecording, audioBlob, error: micError, startRecording, stopRecording, resetRecording } = useVoiceRecorder()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (audioBlob) handleKirimSuara(audioBlob)
  }, [audioBlob])

  function addMsg(dari: 'user' | 'ai', teks: string, sukses?: boolean) {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      dari, teks, waktu: new Date(), sukses,
    }])
  }

  async function handleKirimChat() {
    const teks = input.trim()
    if (!teks || loading) return
    if (fotoFile) {
      await handleKirimStruk(fotoFile)
      return
    }
    setInput('')
    addMsg('user', teks)
    setLoading(true)
    try {
      const hasil = await kirimChat(teks, DEMO_USER_ID)
      addMsg('ai', hasil.pesan, hasil.sukses)
      if (hasil.sukses) onTransaksiSimpan?.()
    } catch {
      addMsg('ai', '❌ Koneksi ke server gagal. Pastikan backend berjalan.', false)
    } finally {
      setLoading(false)
    }
  }

  async function handleKirimSuara(blob: Blob) {
    addMsg('user', '🎤 [Rekaman suara]')
    setLoading(true)
    try {
      const hasil = await kirimSuara(blob, DEMO_USER_ID)
      if (hasil.teks_transkripsi) {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            teks: `🎤 "${hasil.teks_transkripsi}"`,
          }
          return updated
        })
      }
      addMsg('ai', hasil.pesan, hasil.sukses)
      if (hasil.sukses) onTransaksiSimpan?.()
    } catch {
      addMsg('ai', '❌ Gagal kirim suara. Coba ketik manual ya.', false)
    } finally {
      setLoading(false)
      resetRecording()
    }
  }

  async function handleKirimStruk(file: File) {
    addMsg('user', `📸 Scan struk: ${file.name}`)
    setFotoFile(null)
    setFotoPreview(null)
    setLoading(true)
    try {
      const hasil = await kirimStruk(file, DEMO_USER_ID)
      addMsg('ai', hasil.pesan, hasil.sukses)
      if (hasil.sukses) onTransaksiSimpan?.()
    } catch {
      addMsg('ai', '❌ Gagal scan struk. Coba foto lebih jelas ya.', false)
    } finally {
      setLoading(false)
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
    setInput(`📸 Scan struk: ${file.name}`)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        <span className="text-sm font-medium text-gray-700">Input Transaksi</span>
        <span className="ml-auto text-xs text-gray-400">Chat · Suara · Foto</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
        {messages.map(msg => (
          <div key={msg.id} className={clsx('flex', msg.dari === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={clsx(
              'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
              msg.dari === 'user'
                ? 'bg-brand-500 text-white rounded-br-sm'
                : clsx(
                    'rounded-bl-sm',
                    msg.sukses === true ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' :
                    msg.sukses === false ? 'bg-red-50 text-red-900 border border-red-100' :
                    'bg-gray-50 text-gray-800 border border-gray-100'
                  )
            )}>
              {msg.teks}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {fotoPreview && (
        <div className="mx-4 mb-2 relative">
          <img src={fotoPreview} alt="preview struk" className="h-20 rounded-lg object-cover border border-gray-200" />
          <button
            onClick={() => { setFotoFile(null); setFotoPreview(null); setInput('') }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
          >×</button>
        </div>
      )}

      {micError && <p className="px-4 text-xs text-red-500 mb-1">{micError}</p>}

      <div className="p-3 border-t border-gray-100 flex gap-2 items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors flex-shrink-0"
          title="Scan struk"
        >
          <Camera className="w-5 h-5" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />

        <input
          className="flex-1 text-sm bg-gray-50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-200 placeholder-gray-400"
          placeholder='Ketik transaksi... ("jual mie 15rb")'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleKirimChat()}
          disabled={loading}
        />

        <button
          onClick={() => isRecording ? stopRecording() : startRecording()}
          className={clsx(
            'relative p-2 rounded-xl flex-shrink-0 transition-colors',
            isRecording
              ? 'bg-red-500 text-white mic-pulse'
              : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'
          )}
          title={isRecording ? 'Tap untuk stop & kirim' : 'Tap untuk rekam'}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={handleKirimChat}
          disabled={!input.trim() || loading}
          className="p-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}