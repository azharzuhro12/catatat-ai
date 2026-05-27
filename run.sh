#!/bin/bash
# ============================================================
# CatatAI — Jalankan Backend + Frontend Sekaligus
# Jalankan: bash run.sh
# ============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fungsi untuk kill semua proses saat Ctrl+C
cleanup() {
    echo ""
    echo -e "${YELLOW}Menghentikan semua server...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup INT TERM

echo ""
echo -e "${GREEN}🚀 Menjalankan CatatAI...${NC}"
echo ""

# Jalankan backend
echo -e "${YELLOW}▶ Backend FastAPI di http://localhost:8000${NC}"
(
    cd backend
    source venv/bin/activate
    uvicorn app.main:app --reload --port 8000 --log-level warning
) &

# Tunggu backend ready
sleep 2

# Jalankan frontend
echo -e "${YELLOW}▶ Frontend Next.js di http://localhost:3000${NC}"
(
    cd frontend
    npm run dev
) &

echo ""
echo "═══════════════════════════════════════"
echo -e "  ${GREEN}✅ CatatAI berjalan!${NC}"
echo "  Backend  → http://localhost:8000"
echo "  Frontend → http://localhost:3000"
echo "  API Docs → http://localhost:8000/docs"
echo "  Tekan Ctrl+C untuk berhenti"
echo "═══════════════════════════════════════"
echo ""

# Tunggu semua proses
wait
