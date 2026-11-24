# Panduan Keamanan untuk Pemilik Toko

Ringkasan praktik aman dari materi CHAT EKRAF yang diterapkan di website **Dalong Aceh**.
Bahasa sederhana, untuk dibaca pemilik usaha.

## 1. Kunci & password (materi *Vibe Coding UMKM*, slide 12 & 14)
- **Kunci rahasia tidak pernah ditulis di kode.** Konfigurasi Supabase disimpan di
  *Vercel → Project → Settings → Environment Variables*.
- Kunci yang boleh dipakai website hanya kunci **publishable**. Kunci **secret** Supabase jangan pernah dibagikan,
  dan jangan ditempel ke chat AI mana pun.
- Pemeriksa otomatis: `npm run cek:rahasia` menolak commit yang berisi kunci rahasia.
  GitHub juga memblokir push yang berisi rahasia (*Push protection* aktif).
- **Password akun penjual:** minimal 12 karakter, wajib huruf besar, huruf kecil, angka, dan simbol.
  Simpan di password manager (mis. Google Password Manager, Bitwarden).
- **Jangan menempelkan data sensitif ke AI publik**: password, nomor rekening, PIN, kode OTP.

## 2. Login penjual
- Masuk lewat `/admin/login`, tab **Akun penjual**.
- Supabase membatasi **10 percobaan login per 5 menit** per alamat IP (melawan tebak-tebakan password).
- Pendaftaran akun baru **dimatikan**, jadi hanya akun yang dibuat pemilik di Supabase yang bisa masuk,
  dan akun itu juga harus terdaftar sebagai penjual (tabel `admins`).
- **Ganti password:** Supabase → Authentication → Users → pilih akun → *Send password recovery*,
  atau hapus lalu buat ulang akunnya, kemudian daftarkan lagi sebagai penjual:
  ```sql
  insert into public.admins (user_id) select id from auth.users where email = 'email-penjual@contoh.com';
  ```
- Mode demo `admin` / `admin` hanya untuk juri. Mode ini memakai data salinan di browser, bukan data toko asli.

## 3. HTTPS & header keamanan (materi *Panduan Vibe Coding*, hal. 29)
- Vercel memberi HTTPS gratis. Website memakai HSTS, sehingga browser selalu memakai HTTPS.
- Header tambahan di `vercel.json`: CSP (hanya boleh menghubungi project Supabase toko ini), anti-clickjacking,
  `nosniff`, Referrer-Policy, Permissions-Policy, dan perlindungan lintas-origin.

## 4. Titik aman & kalau ada yang rusak (materi *Vibe Coding UMKM* slide 11, *Panduan* hal. 31)
- Setiap fitur selesai = **satu commit** (titik aman). Versi rilis diberi tag, mis. `v1.0`.
- **Coba hal baru di branch `coba/...`.** Vercel otomatis membuat alamat *Preview* untuk dicek,
  tanpa mengganggu website utama.
- **Website rusak setelah update?** Vercel → Project → *Deployments* → pilih deployment sebelumnya yang sehat →
  **Instant Rollback**. Website kembali dalam hitungan detik.
- Untuk membatalkan perubahan kode: `git revert <kode-commit>` lalu push.

## 5. Checklist sebelum membagikan / merilis website
(materi *PRD & Prompting* slide 8, *Vibe Coding UMKM* slide 13)
- [ ] Tombol **Pesan via WA** membuka WhatsApp ke nomor toko yang benar
- [ ] Harga, kuota, dan jadwal ambil sudah benar di dasbor → Pengaturan
- [ ] Dicek di **HP** dan **laptop** (foto tidak terpotong, tombol mudah ditekan)
- [ ] `npm run cek:semua` lulus (typecheck, unit test, pemindai rahasia, `npm audit`)
- [ ] Login penjual dan mode demo `admin`/`admin` berfungsi
- [ ] Header keamanan aktif: `curl -I https://dalong-aceh.vercel.app`

## 6. Perawatan rutin
- **Buka website minimal seminggu sekali.** Supabase gratis menghentikan sementara (pause) project yang tidak
  dipakai sekitar 7 hari. Jika terlanjur, buka dasbor Supabase → *Resume project*.
- Cek **Supabase → Advisors → Security Advisor** setelah mengubah database. Peringatan yang tersisa saat ini
  (`buat_pesanan`, `cek_pesanan`) memang disengaja, lihat `docs/SECURITY-REVIEW.md`.
- Jalankan `npm audit` sebulan sekali dan perbarui paket jika ada kerentanan.
