# CatatAI — Struktur Lengkap & Checklist

## Struktur Folder Final

```
catatat-ai/
│
├── 📄 README.md
├── 🔧 setup.sh          ← jalankan pertama kali
├── 🚀 run.sh            ← jalankan setiap mau development
│
├── backend/
│   ├── 📄 requirements.txt
│   ├── 📄 .env.example  ← copy ke .env, isi API keys
│   └── app/
│       ├── main.py              ← entry point FastAPI
│       ├── core/
│       │   ├── config.py        ← baca .env settings
│       │   └── database.py      ← Supabase client
│       ├── models/
│       │   └── transaksi.py     ← Pydantic schemas
│       ├── prompts/
│       │   └── templates.py     ← Prompt Gemini AI
│       ├── services/
│       │   ├── ai_service.py    ← Gemini: parse, insight, scan
│       │   ├── transaksi_service.py ← business logic
│       │   └── speech_service.py    ← Whisper STT
│       └── api/
│           └── transaksi.py     ← REST API endpoints
│
├── frontend/
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 tailwind.config.js
│   ├── 📄 .env.local.example   ← copy ke .env.local, isi keys
│   └── app/
│       ├── layout.tsx           ← root layout
│       ├── page.tsx             ← halaman utama / dashboard
│       ├── globals.css
│       ├── lib/
│       │   ├── api.ts           ← axios HTTP client
│       │   └── utils.ts         ← helper functions
│       ├── hooks/
│       │   └── useVoiceRecorder.ts ← hook rekam suara
│       └── components/
│           ├── ChatInput.tsx    ← input chat+suara+foto
│           ├── MetricCard.tsx   ← kartu metrik keuangan
│           ├── GrafikKeuangan.tsx ← bar chart recharts
│           ├── InsightCard.tsx  ← card AI insight
│           ├── ListTransaksi.tsx ← daftar transaksi
│           ├── PiutangPanel.tsx ← panel piutang/bon
│           └── LaporanPanel.tsx ← laporan harian/mingguan/bulanan
│
└── supabase/
    └── schema.sql       ← jalankan di Supabase SQL Editor
```

## API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/v1/transaksi/chat` | Input via teks |
| POST | `/api/v1/transaksi/suara` | Input via audio |
| POST | `/api/v1/transaksi/scan-struk` | Scan foto struk |
| GET | `/api/v1/transaksi/list` | Daftar transaksi |
| GET | `/api/v1/transaksi/ringkasan-harian` | Ringkasan + AI insight harian |
| GET | `/api/v1/transaksi/laporan?periode=mingguan` | Laporan periodik |
| GET | `/api/v1/transaksi/piutang` | Daftar piutang aktif |
| POST | `/api/v1/transaksi/piutang/bayar` | Proses bayar piutang |

## Checklist Sebelum Demo

### Backend
- [ ] `backend/.env` sudah diisi semua API keys
- [ ] `uvicorn app.main:app --reload` berjalan tanpa error
- [ ] Buka `localhost:8000/docs` → semua endpoint terlihat
- [ ] Test endpoint `/api/v1/transaksi/chat` dengan Postman/curl

### Database  
- [ ] `supabase/schema.sql` sudah dijalankan
- [ ] Tabel `transaksi`, `piutang`, `profiles`, `kategori` ada
- [ ] Row Level Security aktif

### Frontend
- [ ] `frontend/.env.local` sudah diisi
- [ ] `npm run dev` berjalan tanpa error
- [ ] Buka `localhost:3000` → halaman chat muncul
- [ ] Coba ketik "jual bakso 50rb" → response AI muncul

### Test Bahasa Warung
- [ ] "jual bakso 50 ribu" → pemasukan
- [ ] "kulakan daging 120rb" → pengeluaran  
- [ ] "utang galon bu Eni" → piutang
- [ ] "bon rokok pak budi 15rb" → piutang
- [ ] "bayar separo 25rb" → pemasukan sebagian

## Flow Demo untuk Juri (5 menit)

1. **Tunjukkan chat** — ketik "jual bakso 50rb", AI langsung ngerti
2. **Tunjukkan suara** — tekan mic, bilang "kulakan daging seratus ribu"
3. **Tunjukkan scan struk** — foto struk warung, auto-extract items
4. **Tunjukkan dashboard** — grafik, metrik, insight AI
5. **Tunjukkan piutang** — "utang galon bu Eni", tampil di piutang panel
6. **Tunjukkan laporan** — pilih mingguan, AI narasi otomatis
