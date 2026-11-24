# AGENTS.md — Pedoman untuk AI Agent (OpenCode, Claude Code, Freebuff, dll.)

File ini adalah aturan bersama untuk semua AI agent yang bekerja di proyek ini.
Baca seluruh file ini **dan `docs/PRD.md`** sebelum mengubah apa pun.

## Tentang proyek

- Proyek tugas program **CHAT dari EKRAF** (Kementerian Ekonomi Kreatif).
- Tujuan: website **satu UMKM di Aceh** yang dibangun dengan *vibe coding*, lalu dipublikasikan di **Vercel**.

### Ide terpilih
**Meugang & Kenduri** (nama sementara): website pre-order untuk UMKM daging Meugang, masakan kenduri,
dan kue tradisional Aceh. Fitur utamanya kuota produk, jadwal ambil, kalkulator porsi kenduri,
pesanan ke WhatsApp, dan dashboard admin untuk CRUD produk, pesanan, serta rekap produksi.

### Dokumen acuan
- **PRD: `docs/PRD.md`** adalah sumber kebenaran. Setiap fitur harus bisa dilacak ke satu ID fitur di PRD
  (mis. M3, S1). Jika permintaan bertentangan dengan PRD, tanyakan dulu ke pemilik proyek.
- `docs/SECURITY-REVIEW.md`: hasil security review OWASP.
- `docs/DEBUG-LOG.md`: catatan bug dan perbaikannya (gejala → penyebab → perbaikan → commit).

## Syarat minimum resmi EKRAF (WAJIB, tidak boleh dikurangi)

1. Landing page dan **delapan produk**
2. **Pencarian, filter, sorting**
3. **Integrasi WhatsApp** untuk order
4. **Dashboard demo CRUD**
5. **Admin dashboard dengan username `admin` dan password `admin`**
6. **localStorage dengan validasi**
7. **Vitest dan unit test**
8. **Patch dan debugging terarah**
9. **Security review berdasarkan OWASP**

Ditambah **4 pilar katalog UMKM** dari materi (lihat PRD bagian 5):
1. Katalog & pencarian (foto, harga, deskripsi singkat, filter kategori)
2. **Tombol WhatsApp di SETIAP produk**: satu ketukan, pesan otomatis berisi nama produk
3. Data produk konsisten (foto 4:3 seragam, format `Rp 25.000`, deskripsi ≤ 150 karakter/3 baris, kategori tetap),
   dipaksa oleh validasi form, bukan hanya aturan tertulis
4. Ramah ponsel, cepat, dan mudah diperbarui sendiri oleh pemilik usaha

## Desain

- **Responsif HP dan laptop** (mobile-first): ikuti breakpoint dan ukuran uji di PRD bagian 10.1
  (360, 390, 768, 1366, 1920 px). Tidak boleh ada scroll horizontal. Area sentuh ≥ 44px.
  Semua fitur bisa dipakai dengan keyboard.
- **Palet "Rempah & Songket"** (PRD bagian 10.2) wajib dipakai lewat CSS variables. Jangan menambah warna di luar palet
  tanpa persetujuan pemilik proyek. Jangan menaruh teks putih di atas Kuning Kunyit.

## Teknologi

- **Vite + React + TypeScript**, React Router, **Vitest**.
- **Database: Supabase** (Postgres + Row Level Security + Storage). Skema ada di `supabase/migrations/`.
  Semua aturan penting (kuota, jendela PO, slot, hak admin) **wajib ditegakkan di database**, bukan hanya di frontend.
- Dua sumber data dengan antarmuka sama (`src/services/types.ts`): `live.ts` (Supabase) dan `demo.ts` (localStorage).
  Mode demo dipakai untuk login `admin`/`admin` dan otomatis dipakai jika Supabase belum dikonfigurasi.
- Keranjang pembeli disimpan di **localStorage dengan validasi** (syarat tugas), sesi demo di **sessionStorage**.
- Env: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (lihat `.env.example`).
- Logika bisnis ditulis sebagai fungsi murni di `src/lib/` supaya mudah di-unit test.
- Hosting: **Vercel** (paket Hobby). **Wajib** ada `vercel.json` berisi rewrite SPA **dan** header keamanan
  (lihat bagian Keamanan).
- Build: `npm run build` dengan output `dist`. Test: `npm test`.

## Cara kerja

- **Satu tugas = satu fitur.** Selesaikan dan uji satu fitur sampai stabil sebelum lanjut.
- **Setiap logika baru wajib disertai unit test Vitest** di commit yang sama.
- **Jangan dua agent mengedit file yang sama bersamaan.** Sebelum mulai, cek `git status`.
  Kalau ada perubahan yang belum di-commit dari agent lain, tanyakan dulu ke pemilik proyek.
- Sebelum commit: `npm test` lulus, `npm run build` berhasil, dan tampilan dicek di ukuran mobile.
- **Debugging terarah:** setiap bug dicatat di `docs/DEBUG-LOG.md` (gejala, penyebab, perbaikan),
  lalu diperbaiki dengan commit `fix:` yang kecil dan fokus. Jangan menulis ulang file besar untuk bug kecil.
- Jelaskan singkat fungsi kode yang dibuat supaya pemilik proyek bisa memahaminya.
- Bahasa antarmuka website: **Bahasa Indonesia**.

## Git

- Branch utama: `main`. Untuk eksperimen, pakai branch terpisah.
- Format pesan commit: `init:` / `feat:` / `fix:` / `test:` / `docs:` / `release:`.
- Commit hanya versi yang sudah diuji. Push hanya jika diminta pemilik proyek.

## Keamanan (PRIORITAS UTAMA)

Pemilik proyek mewajibkan website ini **aman**. Keamanan adalah syarat setiap fitur, bukan tambahan di akhir.
Fitur dianggap belum selesai jika melanggar salah satu aturan di bawah.

### Login admin demo (`admin`/`admin`)
Penjual sungguhan login dengan **Supabase Auth** (email + password kuat) dan harus terdaftar di tabel `admins`.
Kredensial `admin`/`admin` **diwajibkan oleh tugas EKRAF**, jadi tetap ada, tapi **hanya membuka mode demo**
(salinan data di localStorage, tidak pernah menyentuh database asli) dan **wajib** dengan mitigasi:
- Label **"MODE DEMO"** yang jelas di halaman login dan dashboard.
- Maksimal **5 percobaan gagal**, lalu login terkunci **5 menit**.
- Sesi di **sessionStorage** dengan masa berlaku **30 menit**, dan ada tombol keluar.
- Semua rute `/admin/*` dijaga pengecekan sesi.
- Di `docs/SECURITY-REVIEW.md` dicatat jujur bahwa ini **risiko yang diterima untuk demo**
  (OWASP A07) dan harus diganti login sungguhan sebelum dipakai untuk usaha nyata.
- Jangan pernah memakai pola kredensial ini untuk hal lain.

### localStorage dengan validasi
- Kunci berversi: `mk:v1:produk`, `mk:v1:pesanan`, `mk:v1:keranjang`, `mk:v1:pengaturan`.
- **Setiap data yang dibaca dianggap tidak tepercaya** (bisa diubah lewat DevTools): `JSON.parse` dalam
  `try/catch`, validasi tipe, rentang, panjang, dan enum. Jika rusak, kembalikan ke data awal tanpa crash.
- Setiap data dari form divalidasi sebelum disimpan.
- Jangan simpan password, token, atau rahasia apa pun di localStorage.
- Data pribadi pembeli seminimal mungkin. Sediakan tombol "Hapus data saya".

### Aturan untuk agen AI (dari materi CHAT)
- **Selalu minta konfirmasi pemilik sebelum `git push`** atau mengubah pengaturan Supabase/Vercel/GitHub.
- **Jangan pernah meminta, menerima, menyimpan, atau menuliskan** password, nomor rekening, PIN, kode OTP,
  atau kunci `secret`/`service_role`. Jika pemilik menempelkannya ke chat, ingatkan untuk menggantinya.
- Nomor rekening untuk DP **hanya dikirim penjual lewat WhatsApp**. Website tidak pernah meminta atau menyimpannya.
- Jalankan `npm run cek:semua` (typecheck, test, pemindai rahasia, audit) sebelum commit.
- Eksperimen di branch `coba/*` (otomatis menjadi Preview URL Vercel), bukan langsung di `main`.

### Rahasia
- **Jangan pernah** menulis API key, token, nomor rekening, atau data sensitif di kode.
- Konfigurasi Supabase dibaca dari **Environment Variables Vercel** (produksi) dan `.env.local` (komputer). Keduanya tidak masuk git.
- Ingat: semua variabel `VITE_*` ikut terkirim ke browser dan bisa dibaca siapa pun.
  Yang boleh hanya kunci Supabase **publishable/anon** (memang publik, dilindungi RLS).
  Kunci **secret/service_role** TIDAK BOLEH ada di frontend, repo, atau env Vercel proyek ini.

### Mencegah XSS & injeksi
- **Dilarang** `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`,
  `eval`, `new Function`.
- Validasi semua input form (tipe, panjang maksimal, format). Parameter URL dianggap tidak tepercaya.
- Link WhatsApp: teks wajib `encodeURIComponent`, dan nomor hanya boleh berisi angka.
- Link ke situs luar wajib `rel="noopener noreferrer"`.
- Angka acak untuk keamanan (kode pesanan) memakai `crypto.getRandomValues`, bukan `Math.random`.

### Header keamanan (wajib di `vercel.json`)
Sesuaikan CSP bila menambah sumber eksternal. **Jangan melonggarkan CSP dengan `unsafe-eval` atau `*`.**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://wa.me; object-src 'none'; upgrade-insecure-requests" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=()" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

- Jangan memuat script dari CDN acak. Install lewat npm supaya ikut di-bundle.
  Jika terpaksa memakai CDN, wajib Subresource Integrity (`integrity` + `crossorigin`).

### Dependensi
- Library seminimal mungkin, populer, dan masih dirawat. Selalu commit `package-lock.json`.
- Sebelum rilis: `npm audit` tanpa kerentanan high/critical.

### Cek sebelum rilis (`release:`)
- [ ] `npm test` lulus semua
- [ ] `npm audit` tanpa high/critical
- [ ] Tidak ada rahasia di kode (cari `key`, `token`, `secret`, `password` di `src/`, kecuali login demo)
- [ ] Tidak ada API berbahaya yang dilarang di atas
- [ ] Data localStorage yang dirusak tidak membuat aplikasi crash
- [ ] Header keamanan aktif: cek URL live di https://securityheaders.com (target nilai **A**)
- [ ] `docs/SECURITY-REVIEW.md` lengkap (OWASP Top 10)
