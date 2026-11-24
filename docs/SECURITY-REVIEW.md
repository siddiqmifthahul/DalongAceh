# Security Review (OWASP Top 10: 2021)

Proyek: **Dapur Mak Ti: Pre-order Meugang & Kenduri**
Tanggal review: 24 November 2026
Lingkup: frontend (Vite + React + TypeScript), database Supabase (Postgres + RLS + Storage), hosting Vercel.

Format: **Risiko → Penerapan di proyek → Mitigasi → Status**

## Ringkasan arsitektur keamanan

- **Pembeli** hanya bisa: membaca produk aktif dan pengaturan toko, membuat pesanan lewat fungsi `buat_pesanan`, dan mengecek pesanan lewat `cek_pesanan` (butuh kode + 4 digit terakhir no. HP). Pembeli **tidak bisa** membaca atau menulis tabel pesanan secara langsung.
- **Penjual** login dengan Supabase Auth (email + password) dan harus terdaftar di tabel `admins`. Semua izin tulis dicek di database lewat Row Level Security (`is_admin()`), bukan hanya di frontend.
- **Mode demo `admin`/`admin`** (diwajibkan tugas) bekerja di salinan data **localStorage** browser pengunjung, sehingga tidak pernah menyentuh database asli.

## Tabel review

| OWASP | Penerapan di proyek | Mitigasi | Status |
|---|---|---|---|
| **A01 Broken Access Control** | Dasbor penjual, CRUD produk, status pesanan | RLS aktif di semua tabel. Tulis produk/pengaturan/pesanan hanya jika `is_admin()`. Pembeli tidak punya policy SELECT/INSERT ke `pesanan` (hanya lewat fungsi `security definer` yang memvalidasi input). Storage: unggah/ubah/hapus foto hanya admin. Route `/admin/*` dijaga di frontend, dan penjagaan sesungguhnya ada di database. | ✅ Termitigasi |
| **A02 Cryptographic Failures** | Login, data pembeli | HTTPS wajib (HSTS + `upgrade-insecure-requests`). Password dikelola Supabase Auth (di-hash di server). Tidak ada password yang disimpan di localStorage. Kunci di frontend hanya kunci **publishable/anon**; kode menolak kunci `service_role`/`sb_secret_`. | ✅ Termitigasi |
| **A03 Injection (XSS, SQL)** | Form pesanan, form produk, pencarian | React meng-escape semua teks. Tidak ada `dangerouslySetInnerHTML`/`innerHTML`/`eval`. Validasi panjang, format, dan karakter `<` `>` di frontend **dan** di constraint database. Query Supabase memakai parameter (tidak ada SQL yang dirangkai dari string). Teks WhatsApp memakai `encodeURIComponent`, nomor hanya angka. CSP ketat tanpa `unsafe-eval`. | ✅ Termitigasi |
| **A04 Insecure Design** | Kuota & pre-order | Kuota dicek dan dikurangi **di server secara atomik** (`select … for update`) agar tidak terjadi overbooking. Jendela PO dan slot dicek di server. Anti-spam: maks. 5 pesanan per nomor per jam dan 60 pesanan per menit per toko. Status "Batal" mengembalikan kuota lewat trigger. | ✅ Termitigasi |
| **A05 Security Misconfiguration** | Header HTTP, Supabase | `vercel.json`: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP. Pendaftaran akun publik di Supabase **dimatikan** (hanya penjual yang dibuatkan akun). Bucket foto membatasi tipe (WebP/JPEG/PNG) dan ukuran (1 MB). | ✅ Termitigasi |
| **A06 Vulnerable & Outdated Components** | Dependensi npm | Library seminimal mungkin (React, React Router, supabase-js, fontsource). `package-lock.json` di-commit. `npm audit`: **0 kerentanan** saat review. | ✅ Termitigasi |
| **A07 Identification & Authentication Failures** | Login demo `admin`/`admin` | **Risiko diterima** karena diwajibkan tugas. Mitigasi: hanya membuka mode demo (data localStorage, bukan database), maks. 5 percobaan lalu terkunci 5 menit, sesi 30 menit di sessionStorage, label "Mode demo" jelas. Login penjual sungguhan memakai Supabase Auth dengan password kuat. | ⚠️ Diterima (demo) |
| **A08 Software & Data Integrity Failures** | localStorage, foto unggahan | Semua data localStorage **divalidasi skema setiap kali dibaca**. Jika rusak/diubah lewat DevTools, data kembali ke awal tanpa crash. Data dari server juga divalidasi. Foto: SVG ditolak, foto di-encode ulang lewat canvas (metadata EXIF/GPS terbuang). Tidak ada script dari CDN. Font di-bundle lewat npm. | ✅ Termitigasi |
| **A09 Security Logging & Monitoring Failures** | Galat & debugging | Pesan galat ke pengguna disaring (detail teknis tidak ditampilkan). Log Supabase (Auth, API, Postgres) tersedia di dasbor Supabase. Bug dan perbaikannya dicatat di `docs/DEBUG-LOG.md`. Tidak ada data pribadi di console. | ✅ Termitigasi |
| **A10 Server-Side Request Forgery** | — | Tidak ada fitur yang membuat server mengambil URL dari input pengguna. URL foto produk hanya boleh `/img/…` atau `https://` dan hanya ditulis oleh admin. | ✅ Tidak berlaku |

## Privasi data pembeli

- Data yang dikumpulkan: nama, nomor WhatsApp, alamat (hanya jika diantar), catatan. Seminimal mungkin.
- Hanya penjual yang bisa membaca data pesanan. Fungsi `cek_pesanan` untuk pembeli **tidak** mengembalikan nama atau nomor HP.
- Nomor WhatsApp penjual memang ditampilkan publik (diperlukan untuk tombol pesan).

## Checklist sebelum rilis

- [x] `npm test`: semua unit test lulus
- [x] `npm audit`: tanpa kerentanan high/critical
- [x] Tidak ada rahasia di kode. Kunci publishable Supabase memang publik dan dilindungi RLS.
- [x] Tidak ada `innerHTML` / `dangerouslySetInnerHTML` / `eval`
- [x] Data localStorage yang dirusak tidak membuat aplikasi crash (diuji di `storage.test.ts`)
- [ ] securityheaders.com nilai A: dicek setelah deploy ke Vercel
- [ ] Pendaftaran akun publik Supabase dimatikan: dicek setelah project dibuat

## Risiko yang tersisa / rekomendasi lanjutan

1. Tambahkan CAPTCHA (mis. Cloudflare Turnstile) di form pesanan jika ada spam nyata.
2. Aktifkan MFA (TOTP) untuk akun penjual di Supabase.
3. Hapus otomatis data pesanan lama (mis. 90 hari setelah momen) untuk mengurangi data pribadi yang tersimpan.
