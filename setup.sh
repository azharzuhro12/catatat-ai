#!/bin/bash
# ============================================================
# CatatAI — Script Setup Otomatis
# Jalankan sekali: bash setup.sh
# ============================================================

set -e  # Berhenti jika ada error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     🤖 CatatAI — Setup Otomatis      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Cek prerequisites ──
echo -e "${YELLOW}[1/5] Mengecek prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 tidak ditemukan. Install dulu: https://python.org${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js tidak ditemukan. Install dulu: https://nodejs.org${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Python $PYTHON_VERSION, Node $NODE_VERSION${NC}"

# ── Setup Backend ──
echo ""
echo -e "${YELLOW}[2/5] Setup Backend (FastAPI)...${NC}"
cd backend

# Buat virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment dibuat${NC}"
fi

# Aktifkan dan install
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo -e "${GREEN}✅ Dependencies backend terinstall${NC}"

# Buat .env jika belum ada
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  File .env dibuat dari template. ISI API KEYS di backend/.env !${NC}"
fi

deactivate
cd ..

# ── Setup Frontend ──
echo ""
echo -e "${YELLOW}[3/5] Setup Frontend (Next.js)...${NC}"
cd frontend

npm install --silent
echo -e "${GREEN}✅ Dependencies frontend terinstall${NC}"

# Buat .env.local jika belum ada
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo -e "${YELLOW}⚠️  File .env.local dibuat. ISI SUPABASE KEYS di frontend/.env.local !${NC}"
fi

cd ..

# ── Informasi Database ──
echo ""
echo -e "${YELLOW}[4/5] Setup Database (Supabase)...${NC}"
echo -e "  1. Buka https://supabase.com dan buat project baru"
echo -e "  2. Buka SQL Editor di Supabase"
echo -e "  3. Copy-paste isi file: ${GREEN}supabase/schema.sql${NC}"
echo -e "  4. Klik Run"

# ── Done! ──
echo ""
echo -e "${YELLOW}[5/5] Setup selesai!${NC}"
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  LANGKAH SELANJUTNYA:                            ║"
echo "║                                                  ║"
echo "║  1. Isi API keys:                                ║"
echo "║     • backend/.env                               ║"
echo "║     • frontend/.env.local                        ║"
echo "║                                                  ║"
echo "║  2. Setup database di Supabase                   ║"
echo "║     (lihat instruksi di atas)                    ║"
echo "║                                                  ║"
echo "║  3. Jalankan:  bash run.sh                       ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
