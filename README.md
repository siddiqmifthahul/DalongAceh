# Dapur Mak Ti: Pre-order Meugang & Kenduri

Website katalog dan pre-order untuk UMKM daging Meugang, masakan kenduri, dan kue tradisional Aceh.
Dibuat untuk tugas program **CHAT EKRAF** dengan pendekatan *vibe coding*.

**Website:** https://pesan-meugang.vercel.app · **Dasbor:** https://pesan-meugang.vercel.app/admin/login (mode demo: `admin` / `admin`)

## Fitur
- Landing page dengan countdown penutupan PO
- Katalog 8 produk: pencarian, filter (kategori, momen, ketersediaan, harga), dan sorting
- Tombol **Pesan via WhatsApp** di setiap produk (satu ketukan) dan pesanan lengkap lewat keranjang
- **Kuota dicek di server**, sehingga tidak bisa overbooking
- Kalkulator porsi kenduri berdasarkan jumlah tamu
- Cek status pesanan (kode + 4 digit terakhir nomor WhatsApp)
- Dasbor penjual: CRUD produk (unggah foto otomatis 4:3), status pesanan, rekap produksi, pengaturan toko
- **Mode demo `admin` / `admin`** untuk penilaian, memakai salinan data di localStorage (tervalidasi)
- Responsif HP & laptop, palet "Rempah & Songket", ornamen Pintu Aceh

## Teknologi
Vite · React · TypeScript · React Router · Supabase (Postgres, Auth, Storage, RLS) · Vitest · Vercel

## Menjalankan di komputer
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit test (Vitest)
npm run typecheck  # cek tipe TypeScript
npm run build      # build produksi ke folder dist
```
Tanpa file `.env.local`, website otomatis berjalan di **mode lokal** (data contoh di browser).

## Menyambungkan Supabase
1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, lalu jalankan isi `supabase/migrations/0001_skema.sql`, kemudian `0002_data_awal.sql`.
3. **Authentication → Sign In / Providers**: matikan *Allow new users to sign up*.
4. **Authentication → Users → Add user**: buat akun penjual (email + password kuat), lalu jadikan admin:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'email-penjual@contoh.com';
   ```
5. Salin `.env.example` menjadi `.env.local`, lalu isi **Project URL** dan kunci **publishable/anon**
   (Project Settings → API). **Jangan** pernah memakai kunci `secret`/`service_role`.

## Deploy ke Vercel
Import repo ini di Vercel (preset Vite), isi Environment Variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`,
lalu Deploy. `vercel.json` sudah berisi rewrite SPA dan header keamanan.

## Dokumen
- [`docs/PRD.md`](docs/PRD.md): kebutuhan produk
- [`docs/SECURITY-REVIEW.md`](docs/SECURITY-REVIEW.md): security review OWASP Top 10
- [`docs/DEBUG-LOG.md`](docs/DEBUG-LOG.md): catatan patch & debugging
- [`AGENTS.md`](AGENTS.md): aturan untuk AI agent (OpenCode, Claude Code, dll.)

## Kredit foto
Foto produk dari Wikimedia Commons (CC BY / CC BY-SA). Daftar lengkap ada di footer website.
