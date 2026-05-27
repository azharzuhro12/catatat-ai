-- ============================================================
-- CatatAI Database Schema
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extend Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_toko   TEXT NOT NULL DEFAULT 'Toko Saya',
  jenis_usaha TEXT DEFAULT 'umum',
  kota        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KATEGORI TRANSAKSI
-- ============================================================
CREATE TABLE IF NOT EXISTS kategori (
  id       SERIAL PRIMARY KEY,
  nama     TEXT NOT NULL,
  tipe     TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran', 'piutang', 'hutang')),
  icon     TEXT DEFAULT '💰',
  warna    TEXT DEFAULT '#1D9E75'
);

-- Data default kategori (bahasa warung)
INSERT INTO kategori (nama, tipe, icon, warna) VALUES
  ('Penjualan',        'pemasukan',   '🛍️',  '#1D9E75'),
  ('Bon / Kredit',     'pemasukan',   '📝',  '#1D9E75'),
  ('Kulakan',          'pengeluaran', '🛒',  '#D85A30'),
  ('Operasional',      'pengeluaran', '⚙️',  '#D85A30'),
  ('Gaji Karyawan',   'pengeluaran', '👤',  '#D85A30'),
  ('Listrik & Air',   'pengeluaran', '💡',  '#D85A30'),
  ('Piutang Masuk',   'piutang',     '📥',  '#3B8BD4'),
  ('Hutang',           'hutang',      '📤',  '#E24B4A')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TRANSAKSI UTAMA
-- ============================================================
CREATE TABLE IF NOT EXISTS transaksi (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipe            TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran', 'piutang', 'hutang')),
  jumlah          BIGINT NOT NULL,                -- dalam rupiah (integer)
  deskripsi       TEXT NOT NULL,
  deskripsi_asli  TEXT,                           -- input mentah dari user ("jual bakso 50rb")
  kategori_id     INTEGER REFERENCES kategori(id),
  nama_pihak      TEXT,                           -- nama pelanggan/supplier
  metode_input    TEXT DEFAULT 'chat'             -- 'chat', 'suara', 'foto'
                  CHECK (metode_input IN ('chat', 'suara', 'foto')),
  sudah_lunas     BOOLEAN DEFAULT TRUE,
  jumlah_lunas    BIGINT DEFAULT 0,
  catatan         TEXT,
  tanggal         DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PIUTANG (bon/kredit pelanggan)
-- ============================================================
CREATE TABLE IF NOT EXISTS piutang (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaksi_id    UUID REFERENCES transaksi(id),
  nama_pelanggan  TEXT NOT NULL,
  jumlah_total    BIGINT NOT NULL,
  jumlah_dibayar  BIGINT DEFAULT 0,
  sisa            BIGINT GENERATED ALWAYS AS (jumlah_total - jumlah_dibayar) STORED,
  status          TEXT DEFAULT 'belum_lunas'
                  CHECK (status IN ('belum_lunas', 'sebagian', 'lunas')),
  tanggal_bon     DATE DEFAULT CURRENT_DATE,
  tanggal_lunas   DATE,
  keterangan      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LAPORAN CACHE (disimpan untuk performa)
-- ============================================================
CREATE TABLE IF NOT EXISTS laporan_cache (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  periode     TEXT NOT NULL,   -- 'harian', 'mingguan', 'bulanan'
  tanggal     DATE NOT NULL,
  data        JSONB NOT NULL,
  ai_narasi   TEXT,            -- narasi dari Gemini
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, periode, tanggal)
);

-- ============================================================
-- ROW LEVEL SECURITY (keamanan per user)
-- ============================================================
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi   ENABLE ROW LEVEL SECURITY;
ALTER TABLE piutang     ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_cache ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa akses data sendiri
CREATE POLICY "user_own_profile"    ON profiles    FOR ALL USING (auth.uid() = id);
CREATE POLICY "user_own_transaksi"  ON transaksi   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_piutang"    ON piutang     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_laporan"    ON laporan_cache FOR ALL USING (auth.uid() = user_id);

-- Kategori bisa dibaca semua orang
CREATE POLICY "kategori_public_read" ON kategori FOR SELECT USING (true);

-- ============================================================
-- INDEXES untuk performa query
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transaksi_user_tanggal ON transaksi(user_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_transaksi_tipe ON transaksi(user_id, tipe);
CREATE INDEX IF NOT EXISTS idx_piutang_user_status ON piutang(user_id, status);

-- ============================================================
-- FUNCTION: Auto-create profile saat user register
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nama_toko)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama_toko', 'Toko Saya'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
