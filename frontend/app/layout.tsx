import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CatatAI — Catat Keuangan Warung Pakai AI',
  description: 'AI Financial Assistant untuk UMKM Indonesia. Ngerti bahasa warung: bon, kulakan, utang, bayar separo.',
  other: {
    'dicoding:email': 'azharzuhro49@student.cs.unida.gontor.ac.id',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}