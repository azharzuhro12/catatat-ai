# CatatAI — AI Financial Assistant untuk UMKM

> AI yang ngerti bahasa warung: "utang galon", "kulakan", "bon", "bayar separo"

## Struktur Proyek

```
catatat-ai/
├── backend/                  # FastAPI Python
│   ├── app/
│   │   ├── api/              # Route endpoints
│   │   ├── core/             # Config, security
│   │   ├── models/           # Pydantic models
│   │   ├── services/         # Business logic
│   │   └── prompts/          # AI prompt templates
│   ├── .env                  # Environment variables
│   └── requirements.txt
├── frontend/                 # Next.js React
│   ├── app/
│   │   ├── components/       # UI components
│   │   ├── lib/              # API client, utils
│   │   └── hooks/            # Custom React hooks
│   ├── .env.local
│   └── package.json
├── supabase/
│   └── schema.sql            # Database schema
└── docs/
    └── API.md
```

## Tech Stack

| Layer    | Teknologi                            |
|----------|--------------------------------------|
| Frontend | Next.js 14, Tailwind CSS, Recharts   |
| Backend  | FastAPI, Python 3.11                 |
| AI       | Gemini 1.5 Flash (Google AI)         |
| Database | Supabase (PostgreSQL + Realtime)     |
| Speech   | Whisper via OpenAI API               |
| Auth     | Supabase Auth                        |

## Quick Start

1. **Clone & setup** — ikuti `docs/SETUP.md`
2. **Jalankan backend** — `cd backend && uvicorn app.main:app --reload`
3. **Jalankan frontend** — `cd frontend && npm run dev`
4. **Buka** — http://localhost:3000

## Fitur MVP

- ✅ Input transaksi via chat (bahasa warung)
- ✅ Input suara (speech-to-text)
- ✅ Scan struk foto (OCR via Gemini Vision)
- ✅ Dashboard pemasukan/pengeluaran/grafik
- ✅ Laporan harian, mingguan, bulanan
- ✅ AI insight & narasi keuangan otomatis
