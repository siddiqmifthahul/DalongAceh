# AGENTS.md — Pedoman untuk AI Agent (OpenCode, Claude Code, Freebuff, dll.)

File ini adalah aturan bersama untuk semua AI agent yang bekerja di proyek ini.
Baca seluruh file ini sebelum mengubah apa pun.

## Tentang proyek

- Proyek tugas program **CHAT dari EKRAF** (Kementerian Ekonomi Kreatif).
- Tujuan: membangun **website untuk UMKM / ekonomi kreatif** dengan pendekatan *vibe coding*,
  lalu dipublikasikan di **Vercel**.
- **Ide website: BELUM DIPILIH.** Jangan mulai menulis kode fitur sebelum ide dan PRD
  ditetapkan. Setelah dipilih, isi bagian "Ide terpilih" di bawah.

### Ide terpilih
_(belum ada, akan diisi setelah ide dipilih)_

### Dokumen acuan
- PRD: `docs/PRD.md` (dibuat setelah ide dipilih). PRD adalah sumber kebenaran:
  setiap fitur harus bisa dilacak ke satu butir di PRD.

## Fitur dasar yang wajib ada (dari materi CHAT)

1. **Katalog + pencarian**, dengan filter kategori bila relevan.
2. **Tombol pesan WhatsApp** (`https://wa.me/<nomor>?text=<pesan>`) dengan pesan otomatis
   yang berisi nama produk. Pesan wajib di-encode dengan `encodeURIComponent`.
3. **Data produk konsisten**: ukuran foto seragam, format harga `Rp 25.000`, deskripsi maksimal 3 baris.
4. **Mobile-first**: tampil rapi di layar HP (lebar 360px ke atas), tombol mudah ditekan,
   halaman terbuka di bawah 3 detik.

## Teknologi (default, boleh diubah lewat PRD)

- **Vite** + JavaScript/TypeScript. Utamakan yang ringan, jangan pakai framework berat
  kalau tidak perlu.
- Tanpa backend: data produk disimpan di file JSON (`src/data/`) atau `localStorage`.
- Hosting: **Vercel** (paket Hobby). Jika memakai routing SPA, **wajib** ada `vercel.json`
  agar route seperti `/admin` tidak error 404:

  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

- Build: `npm run build`, dengan output di folder `dist`.

## Cara kerja

- **Satu tugas = satu fitur.** Selesaikan dan uji satu fitur sampai stabil sebelum lanjut ke fitur berikutnya.
- **Jangan dua agent mengedit file yang sama bersamaan.** Sebelum mulai, cek `git status`.
  Kalau ada perubahan yang belum di-commit dari agent lain, tanyakan dulu ke pemilik proyek.
- Sebelum commit, pastikan `npm run build` berhasil dan tampilan sudah dicek di ukuran mobile.
- Jelaskan singkat fungsi kode yang dibuat supaya pemilik proyek bisa memahami dan mengubah kontennya sendiri.
- Bahasa antarmuka website: **Bahasa Indonesia**.

## Git

- Branch utama: `main`. Untuk eksperimen, pakai branch terpisah.
- Format pesan commit:
  - `init: ...` untuk struktur awal
  - `feat: ...` untuk fitur baru
  - `fix: ...` untuk perbaikan bug
  - `docs: ...` untuk dokumen (PRD, README)
  - `release: ...` untuk versi siap publish
- Commit hanya versi yang sudah diuji. Push hanya jika diminta pemilik proyek.

## Keamanan

- **Jangan pernah** menulis API key, password, nomor rekening, atau data sensitif langsung di kode.
  Simpan di environment variable (`.env`, yang sudah di-ignore) atau di Vercel Environment Variables.
- Login admin demo (jika ada) hanya untuk demo. Beri tanda jelas bahwa itu bukan keamanan sungguhan.
