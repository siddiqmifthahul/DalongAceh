# PRD: Meugang & Kenduri (nama sementara ✏️)

> **Status:** Draf v0.2 · 24 November 2026
> **Cara membaca:** bagian bertanda ✏️ adalah tebakan atau contoh yang perlu kamu ubah sesuai pemikiranmu.
> Angka harga, kuota, dan aturan porsi di dokumen ini **hanya contoh** dan belum berasal dari UMKM sungguhan.
>
> **Perubahan v0.2:** + 4 pilar katalog UMKM (bagian 5) termasuk tombol WhatsApp di setiap produk;
> + tampilan responsif HP & laptop (bagian 10.1); + palet warna bermakna (bagian 10.2);
> + standar data produk (bagian 9.4).

---

## 0. Ringkasan

Website pre-order untuk **satu UMKM di Aceh** yang menjual **daging Meugang, masakan kenduri, dan kue
tradisional**. Pembeli bisa melihat 8 produk, mencari, memfilter, dan mengurutkan produk, lalu memesan
dengan dua cara:
1. **Pesan cepat:** satu ketukan tombol WhatsApp di kartu produk.
2. **Pesan lengkap:** lewat keranjang dengan jadwal ambil, kode pesanan, dan kuota otomatis.

Pemilik usaha punya **dashboard admin** untuk mengelola produk (CRUD), kuota, pesanan, dan **rekap produksi**,
dan bisa memperbarui sendiri tanpa bantuan teknis.

Website nyaman dipakai di **HP maupun laptop**. Semua data disimpan di **localStorage** (tanpa server)
sesuai syarat tugas EKRAF.

---

## 1. Latar Belakang

- Menjelang **Meugang** (sebelum Ramadan, Idul Fitri, dan Idul Adha), hampir semua keluarga di Aceh membeli
  daging pada hari yang sama. Saat **kenduri** (Maulid, walimah), katering dan pembuat kue menerima pesanan besar.
- Pesanan UMKM masih dicatat lewat chat WhatsApp, sehingga:
  - pesanan **terlewat atau tercatat dobel**,
  - penjual **menerima pesanan melebihi kapasitas**,
  - penjual **tidak tahu total yang harus disiapkan** per hari (berapa kg daging, berapa pcs kue).
- Katalog produk masih tersebar di status WhatsApp dan sulit dicari pembeli.
- Pembeli tidak tahu apakah barang masih tersedia, dan bingung harus memesan berapa banyak untuk sekian tamu.

**Profil UMKM contoh ✏️:** "Dapur Meugang Mak Ti", usaha keluarga di Banda Aceh yang menjual daging
Meugang, menerima pesanan masakan kenduri, dan membuat kue tradisional.

---

## 2. Tujuan

### Tujuan tugas (wajib)
Memenuhi seluruh **Minimum Kerangka Prompt Project EKRAF** (bagian 4) dan **4 pilar katalog UMKM** (bagian 5).

### Tujuan bisnis (contoh, terukur ✏️)
| Tujuan | Ukuran |
|---|---|
| Pesanan tercatat rapi | 100% pesanan punya kode unik dan tidak ada pesanan dobel |
| Tidak ada overbooking | 0 pesanan melebihi kuota produk |
| Rekap produksi cepat | Pemilik bisa tahu total produksi per momen dalam < 1 menit |
| Pemesanan mudah | Pesan cepat: 1 ketukan. Pesan lengkap: ≤ 3 menit dari HP |
| Mandiri | Pemilik bisa menambah satu produk baru sendiri dalam < 2 menit |

---

## 3. Target Pengguna

| Persona | Kebutuhan | Perangkat |
|---|---|---|
| **Kak Nur, ibu rumah tangga, 30–45 th** | Pesan daging Meugang tanpa antre, pasti kebagian | **HP**, lewat link di WhatsApp/Instagram |
| **Bang Rizal, panitia kenduri meunasah/kantor** | Tahu berapa banyak yang harus dipesan untuk 100–300 tamu | **HP dan laptop** kantor, membandingkan paket dan total harga |
| **Mak Ti, pemilik UMKM** | Atur kuota, lihat semua pesanan, tahu total yang harus dimasak | **HP** sehari-hari, **laptop** untuk rekap; tidak paham teknis |

---

## 4. Syarat Minimum EKRAF dan Cara Memenuhinya

| # | Syarat dari EKRAF | Cara dipenuhi di proyek ini |
|---|---|---|
| 1 | Landing page dan **delapan produk** | Beranda + katalog berisi tepat 8 produk awal (bagian 9.1) |
| 2 | **Pencarian, filter, sorting** | Cari nama/deskripsi; filter kategori, momen, ketersediaan, rentang harga; urutkan harga, nama, sisa kuota |
| 3 | **Integrasi WhatsApp untuk order** | Tombol WhatsApp di setiap produk (pesan cepat) **dan** keranjang dengan pesan lengkap + kode pesanan |
| 4 | **Dashboard demo CRUD** | Admin bisa tambah, lihat, ubah, hapus produk (+ kelola kuota dan pesanan) |
| 5 | **Admin dashboard, username `admin`, password `admin`** | Halaman `/admin/login` dengan kredensial demo tersebut + mitigasi keamanan (bagian 12) |
| 6 | **localStorage dengan validasi** | Semua data di localStorage; setiap data dibaca **divalidasi** dan dikembalikan ke data awal bila rusak (bagian 9.3) |
| 7 | **Vitest dan unit test** | Unit test untuk semua logika penting (bagian 13) |
| 8 | **Patch dan debugging terarah** | Bug dicatat di `docs/DEBUG-LOG.md`: gejala, penyebab, perbaikan, commit `fix:` |
| 9 | **Security review berdasarkan OWASP** | `docs/SECURITY-REVIEW.md` yang memetakan OWASP Top 10 ke proyek ini (bagian 12) |

---

## 5. Empat Pilar Katalog UMKM (dari materi CHAT)

| Pilar | Isi menurut materi | Penerapan di proyek ini |
|---|---|---|
| **1. Katalog & Pencarian** (fitur wajib) | Daftar produk dengan foto, harga, deskripsi singkat; kolom pencarian dan filter kategori | Kartu produk berisi foto, nama, harga + satuan, deskripsi ≤ 3 baris, sisa kuota. Pencarian langsung (hasil berubah saat mengetik) + filter kategori + sorting (M2–M5) |
| **2. Tombol Pesan WhatsApp** (konversi) | Setiap produk punya tombol pesan langsung ke WhatsApp penjual, pesan otomatis berisi nama produk, cukup **satu ketukan** | Tombol **"Pesan via WhatsApp"** di setiap kartu dan halaman detail produk. Satu ketukan langsung membuka WhatsApp dengan pesan berisi nama produk, harga, dan satuan (M15). Pesan lengkap lewat keranjang tetap ada (M6–M7) |
| **3. Data Produk Konsisten** (konten) | Ukuran foto seragam, format harga jelas, deskripsi maks. 3 baris, penamaan kategori konsisten | Standar data **dipaksa oleh validasi form admin**, bukan sekadar aturan tertulis (bagian 9.4, M16) |
| **4. Kriteria Sukses** (kualitas) | Ramah ponsel, cepat diakses, mudah diperbarui sendiri oleh pemilik tanpa bantuan teknis | Responsif HP & laptop (bagian 10.1), halaman terbuka < 3 detik, dashboard admin berbahasa sederhana dengan pratinjau kartu produk (M10, M17) |

---

## 6. Daftar Fitur (MoSCoW)

### Must: wajib ada
| ID | Fitur | Keterangan |
|---|---|---|
| M1 | **Landing page** | Hero dengan momen aktif + countdown PO, keunggulan UMKM, produk unggulan, cara pesan, kontak |
| M2 | **Katalog 8 produk** | Kartu produk: foto, nama, harga + satuan, deskripsi ≤ 3 baris, sisa kuota (progress bar), tombol tambah ke keranjang, tombol WhatsApp |
| M3 | **Pencarian** | Cari berdasarkan nama dan deskripsi, tidak peka huruf besar/kecil, hasil langsung berubah |
| M4 | **Filter** | Kategori, momen, "hanya yang tersedia", rentang harga |
| M5 | **Sorting** | Harga termurah, harga termahal, nama A–Z, sisa kuota terbanyak |
| M6 | **Keranjang** | Tambah/kurangi/hapus item, total otomatis, tersimpan di localStorage |
| M7 | **Form pesanan lengkap + WhatsApp** | Nama, no HP, metode (ambil/antar ✏️), slot waktu, catatan; tervalidasi, lalu membuka WhatsApp penjual dengan kode pesanan |
| M8 | **Kuota produk** | Tombol tambah mati bila kuota habis; jumlah di keranjang tidak bisa melebihi sisa kuota |
| M9 | **Login admin demo** | `admin` / `admin`, dengan batas percobaan login dan sesi kedaluwarsa |
| M10 | **Dashboard CRUD produk** | Tambah, ubah, hapus produk + atur kuota dan status aktif, dengan validasi form dan **pratinjau kartu produk** sebelum disimpan |
| M11 | **Daftar pesanan** | Lihat pesanan, ubah status: Baru, DP, Lunas, Diambil, Batal |
| M12 | **localStorage tervalidasi** | Semua data divalidasi saat dibaca dan ditulis |
| M13 | **Unit test (Vitest)** | Lihat bagian 13 |
| M14 | **Security review OWASP** | Lihat bagian 12 |
| M15 | **Tombol WhatsApp di setiap produk** (pilar 2) | Satu ketukan, langsung membuka WhatsApp dengan pesan otomatis berisi nama produk (bagian 11, aturan 4a). Tombol tetap ada walau kuota habis, tapi teksnya berubah menjadi "Tanya ketersediaan" |
| M16 | **Standar data produk konsisten** (pilar 3) | Foto dipotong otomatis ke rasio seragam, harga selalu `Rp 180.000`, deskripsi maks. 150 karakter (≈ 3 baris), kategori dipilih dari daftar tetap (bagian 9.4) |
| M17 | **Responsif HP & laptop** | Tata letak menyesuaikan layar 360px sampai 1920px, termasuk dashboard admin (bagian 10.1) |
| M18 | **Palet warna & identitas visual** | Mengikuti palet "Rempah & Songket" (bagian 10.2) |

### Should: sangat disarankan
| ID | Fitur | Keterangan |
|---|---|---|
| S1 | **Kalkulator porsi kenduri** | Masukkan jumlah tamu, dapat rekomendasi jumlah produk, lalu satu klik masuk keranjang |
| S2 | **Rekap produksi** | Total per produk per momen/tanggal, misalnya "Daging sapi: 46 kg, Timphan: 300 pcs" |
| S3 | **Pengaturan momen** | Admin mengatur momen aktif dan tanggal buka/tutup PO |
| S4 | **Halaman cek pesanan** | Pembeli memasukkan kode pesanan dan melihat ringkasan pesanannya (di perangkat yang sama) |
| S5 | **Tombol reset data demo** | Kembalikan semua data ke kondisi awal, berguna saat presentasi |
| S6 | **Catat pesanan manual** | Admin mencatat pesanan yang masuk lewat tombol WhatsApp cepat, supaya ikut terhitung di kuota dan rekap |

### Could: kalau waktu masih ada
| ID | Fitur |
|---|---|
| C1 | Pengingat ke kalender HP (file `.ics`) untuk jadwal ambil |
| C2 | Pilihan Bahasa Aceh / Indonesia |
| C3 | Ekspor rekap/pesanan ke file CSV |
| C4 | Mode gelap |

### Won't: tidak di versi ini
- Pembayaran online di dalam website (DP/transfer tetap lewat WhatsApp).
- Server/database sungguhan dan login sungguhan (di luar syarat tugas, lihat bagian 16).
- Banyak UMKM (marketplace).

---

## 7. Alur Pengguna

### Pembeli: pesan cepat (1 ketukan)
```
Lihat kartu produk → ketuk "Pesan via WhatsApp"
  → WhatsApp terbuka: "Assalamu'alaikum, saya mau pesan Daging Sapi Meugang (Rp 180.000/kg). Apakah masih tersedia?"
```

### Pembeli: pesan lengkap
```
Buka web → landing page (momen aktif + countdown)
  → katalog: cari / filter / urutkan
  → (opsional) kalkulator porsi: "kenduri 150 orang" → rekomendasi masuk keranjang
  → keranjang → isi form (nama, no HP, metode, slot)
  → validasi lolos → kode pesanan dibuat, kuota berkurang, pesanan tersimpan
  → WhatsApp terbuka dengan pesan lengkap siap kirim ke penjual
```

### Pemilik UMKM (admin)
```
/admin/login (admin/admin) → dashboard
  → Produk: tambah / ubah / hapus / atur kuota (dengan pratinjau kartu)
  → Pesanan: lihat, ubah status, catat pesanan manual dari WhatsApp
  → Rekap produksi per momen
  → Pengaturan momen & tanggal PO
  → Keluar (atau sesi habis otomatis)
```

---

## 8. Halaman

| Rute | Isi | Akses |
|---|---|---|
| `/` | Landing page | Publik |
| `/produk` | Katalog + pencarian, filter, sorting | Publik |
| `/produk/:id` | Detail produk + tombol WhatsApp | Publik |
| `/kalkulator` | Kalkulator porsi kenduri | Publik |
| `/keranjang` | Keranjang + form pesanan | Publik |
| `/pesanan` | Cek pesanan dengan kode | Publik |
| `/admin/login` | Login admin demo | Publik |
| `/admin` | Ringkasan (jumlah pesanan, produk hampir habis) | Admin |
| `/admin/produk` | CRUD produk + kuota | Admin |
| `/admin/pesanan` | Daftar pesanan + status + catat manual | Admin |
| `/admin/rekap` | Rekap produksi | Admin |
| `/admin/pengaturan` | Momen, tanggal PO, no WhatsApp, reset data demo | Admin |

---

## 9. Data

### 9.1 Delapan produk awal (contoh ✏️)

| # | Nama | Kategori | Satuan | Harga (contoh) | Kuota (contoh) | Momen |
|---|---|---|---|---|---|---|
| 1 | Daging Sapi Meugang | Daging Meugang | kg | Rp 180.000 | 100 | Semua Meugang |
| 2 | Daging Kerbau Meugang | Daging Meugang | kg | Rp 190.000 | 60 | Semua Meugang |
| 3 | Sie Reuboh | Daging Meugang | kg | Rp 220.000 | 30 | Semua Meugang |
| 4 | Paket Kuah Beulangong (50 porsi) | Masakan Kenduri | paket | Rp 2.500.000 | 8 | Kenduri |
| 5 | Paket Kari Kambing Aceh (50 porsi) | Masakan Kenduri | paket | Rp 2.800.000 | 6 | Kenduri |
| 6 | Timphan (isi 50) | Kue Tradisional | kotak | Rp 150.000 | 40 | Semua |
| 7 | Kue Bhoi (isi 50) | Kue Tradisional | kotak | Rp 125.000 | 40 | Semua |
| 8 | Keukarah (1 kotak) | Kue Tradisional | kotak | Rp 60.000 | 50 | Semua |

**Momen:** Meugang Ramadan, Meugang Idul Fitri, Meugang Idul Adha, Kenduri (Maulid/walimah) ✏️

### 9.2 Struktur data

```ts
Produk {
  id: string            // dibuat otomatis
  nama: string          // 3–60 karakter
  kategori: "daging" | "masakan" | "kue"   // ditampilkan: "Daging Meugang" | "Masakan Kenduri" | "Kue Tradisional"
  satuan: "kg" | "paket" | "kotak"
  harga: number         // bilangan bulat, 1.000 – 50.000.000
  deskripsi: string     // 10–150 karakter (≈ 3 baris)
  foto: string          // path lokal /img/... atau data URL hasil kompres (bagian 9.4)
  momen: string[]       // daftar id momen
  kuota: number         // bilangan bulat ≥ 0
  terpesan: number      // 0 ≤ terpesan ≤ kuota
  minPesan: number      // ≥ 1
  aktif: boolean
}

Pesanan {
  kode: string          // 8 karakter acak, mis. "MK-7Q4XK2PD"
  waktu: string         // ISO date
  sumber: "web" | "manual"   // manual = dicatat admin dari WhatsApp cepat
  momen: string
  items: { produkId, nama, jumlah, hargaSatuan }[]
  total: number
  nama: string          // 2–50 karakter, huruf/spasi
  noHp: string          // format Indonesia: 08xx / 628xx, 10–15 digit
  metode: "ambil" | "antar"
  alamat?: string       // wajib jika antar, maks. 200 karakter
  slot: string          // mis. "2027-02-15 07:00–09:00"
  catatan?: string      // maks. 200 karakter
  status: "baru" | "dp" | "lunas" | "diambil" | "batal"
}

Pengaturan {
  namaUsaha, noWhatsApp, momenAktif, poBuka, poTutup, slotTersedia[]
}
```

### 9.3 Aturan localStorage + validasi

- **Kunci (key) berversi:** `mk:v1:produk`, `mk:v1:pesanan`, `mk:v1:keranjang`, `mk:v1:pengaturan`.
- **Validasi saat MEMBACA:** data diperiksa (tipe, rentang angka, panjang teks, nilai enum).
  Jika rusak atau diubah sembarangan lewat DevTools, data dikembalikan ke **data awal**,
  muncul peringatan di console, dan aplikasi **tidak boleh crash**.
- **Validasi saat MENULIS:** data dari form divalidasi dulu. Data yang tidak valid ditolak dengan pesan
  error yang jelas di form.
- `JSON.parse` selalu dibungkus `try/catch`.
- Batasi jumlah data (maks. 30 produk, maks. 500 pesanan) agar localStorage (± 5 MB) tidak penuh.
  Jika penyimpanan penuh, tampilkan pesan yang jelas dan jangan crash.
- Sesi admin disimpan di **sessionStorage** (hilang saat tab ditutup) dengan waktu kedaluwarsa.

### 9.4 Standar data produk (pilar 3), dipaksa oleh validasi

| Aspek | Standar | Cara memaksa |
|---|---|---|
| **Foto** | Rasio **4:3**, 800 × 600 px, format WebP/JPEG, ≤ 100 KB | Foto yang diunggah admin otomatis **dipotong ke tengah, diperkecil, dan dikompres** di browser (canvas). Hanya menerima JPEG/PNG/WebP; **SVG ditolak** (bisa berisi script). Proses ini juga membuang metadata EXIF (mis. lokasi GPS). |
| **Harga** | `Rp 180.000` (titik pemisah ribuan, tanpa desimal) + satuan: `/kg`, `/paket`, `/kotak` | Satu fungsi `formatRupiah()` dipakai di semua tempat; input harga hanya menerima angka bulat |
| **Deskripsi** | Maks. 150 karakter, tampil maks. 3 baris | Validasi panjang + penghitung karakter di form + CSS `line-clamp: 3` |
| **Nama produk** | 3–60 karakter, Huruf Kapital Di Awal Kata | Validasi panjang + dirapikan otomatis saat disimpan |
| **Kategori** | Hanya: Daging Meugang, Masakan Kenduri, Kue Tradisional | Dipilih dari dropdown, tidak bisa diketik bebas |

---

## 10. Desain & Tampilan

### 10.1 Responsif: HP dan laptop (M17)

Dirancang **mobile-first** (mulai dari HP), lalu melebar untuk tablet dan laptop.

| Ukuran layar | Contoh perangkat | Tata letak publik | Tata letak admin |
|---|---|---|---|
| **HP** 360–767 px | Android, iPhone | Katalog **2 kolom** (1 kolom di < 400 px), filter dalam **panel geser dari bawah**, tombol keranjang melayang di bawah | Menu di **bawah layar** (bottom nav), daftar pesanan tampil sebagai **kartu** |
| **Tablet** 768–1023 px | iPad, tablet Android | Katalog **3 kolom**, filter di panel yang bisa dibuka | Menu samping yang bisa diciutkan |
| **Laptop** ≥ 1024 px | Laptop 1366×768, monitor 1920×1080 | Katalog **4 kolom**, **filter selalu tampil di sidebar kiri**, keranjang sebagai panel samping | **Sidebar menu tetap**, pesanan dalam **tabel** yang bisa diurutkan |

Aturan wajib:
- Tidak ada scroll horizontal di ukuran mana pun. Lebar konten maksimal 1280px dan rata tengah di layar lebar.
- Tombol dan area sentuh minimal **44 × 44 px** di HP.
- Di laptop: efek hover, fokus keyboard terlihat jelas, dan seluruh fitur bisa dipakai dengan **keyboard saja**
  (Tab, Enter, Esc untuk menutup panel).
- Teks minimal 16px untuk isi, tidak perlu zoom.
- Gambar responsif (`srcset`/ukuran sesuai layar) supaya HP tidak mengunduh gambar besar.
- **Ukuran uji wajib:** 360×800, 390×844, 768×1024, 1366×768, 1920×1080.

### 10.2 Palet warna: "Rempah & Songket" (M18)

Palet diambil dari **apa yang ada di sebuah kenduri Aceh**: daging Meugang, rempah kuah beulangong,
daun pisang alas hidangan, kayu bakar di bawah kuali besar, dan benang emas songket pada pakaian adat.
Pesannya: **hangat, meriah, penuh syukur, dan berakar pada tradisi Aceh.**

| Peran | Nama | Hex | Makna | Dipakai untuk |
|---|---|---|---|---|
| **Utama** | Merah Meugang | `#8E1B1B` | Daging Meugang dan warna merah dalam ornamen adat Aceh: semangat berbagi | Header, tombol utama ("Tambah ke keranjang", "Kirim pesanan"), judul |
| **Aksen** | Kuning Kunyit | `#D9A21B` | Rempah kuah beulangong + benang emas songket: kemeriahan dan syukur | Badge momen, countdown, sorotan harga, garis ornamen |
| **Pendukung** | Hijau Daun Pisang | `#2F6B3A` | Daun pisang alas hidangan kenduri, kesegaran, nuansa Islami | **Tombol WhatsApp**, status "tersedia", pesan berhasil |
| **Teks** | Hitam Kayu Arang | `#1F1A17` | Kayu bakar di bawah kuali beulangong, kain hitam pakaian adat Aceh | Teks utama, footer |
| **Latar** | Krem Santan | `#FBF5EA` | Santan dan nasi kenduri: lembut dan bersih | Latar halaman |
| **Permukaan** | Putih | `#FFFFFF` | | Kartu produk, form, tabel |
| **Teks redup** | Cokelat Rempah | `#6B5E55` | | Deskripsi, label, teks sekunder |
| **Garis** | Pasir | `#E8DCC8` | | Border kartu, pemisah |
| **Error** | Merah Bata | `#B42318` | | Pesan error form (selalu disertai ikon + teks) |

**Kontras (sudah dihitung, memenuhi WCAG AA ≥ 4,5:1):**
- Merah Meugang di atas Krem Santan ≈ **8,3 : 1** ✅ · teks putih di atas Merah Meugang ≈ **9 : 1** ✅
- Teks putih di atas Hijau Daun Pisang ≈ **6,4 : 1** ✅
- Teks Hitam Kayu di atas Kuning Kunyit ≈ **7,5 : 1** ✅. **Jangan** pakai teks putih di atas kuning (kontras rendah).
- Cokelat Rempah di atas Krem Santan ≈ **5,7 : 1** ✅

**Aturan pemakaian:**
- Komposisi kira-kira **60% krem/putih, 30% merah & hitam, 10% kuning & hijau**, supaya tetap terasa bersih, tidak ramai.
- Status tidak boleh dibedakan hanya dengan warna. Selalu sertakan teks atau ikon (mis. "Habis", "Tersedia").
- Semua warna disimpan sebagai **CSS variables** (`--warna-utama`, dst.) supaya mudah diganti.

**Elemen visual pendukung ✏️:**
- Ornamen garis tipis bermotif **Pintu Aceh** atau **Pucok Reubong** berwarna Kuning Kunyit sebagai pemisah bagian.
- Huruf: judul memakai font serif yang hangat, isi memakai font sans-serif yang mudah dibaca.
  Font di-*self-host* lewat npm (`@fontsource/...`) supaya sesuai CSP `font-src 'self'`.

---

## 11. Aturan Bisnis

1. **Kuota:** saat pesanan lengkap dikirim (atau pesanan manual dicatat admin), `terpesan` bertambah.
   Jika status menjadi **Batal**, kuota dikembalikan. Jumlah di keranjang tidak boleh melebihi `kuota − terpesan`.
2. **Jendela PO:** di luar tanggal `poBuka`–`poTutup`, tombol pesan lengkap nonaktif dan muncul info
   "PO dibuka pada …". Tombol WhatsApp cepat tetap aktif untuk bertanya.
3. **Kode pesanan:** dibuat dengan `crypto.getRandomValues` (bukan `Math.random`), tanpa huruf yang
   membingungkan (O/0, I/1).
4. **Format pesan WhatsApp:**

   **a. Pesan cepat (tombol di setiap produk, 1 ketukan):**
   ```
   Assalamu'alaikum, saya mau pesan Daging Sapi Meugang (Rp 180.000/kg).
   Apakah masih tersedia?
   ```
   Jika kuota habis, teks tombol menjadi "Tanya ketersediaan" dan pesannya menyesuaikan.

   **b. Pesan lengkap (dari keranjang):**
   ```
   Assalamu'alaikum, saya mau pesan (Meugang Ramadan)
   Kode: MK-7Q4XK2PD
   - Daging Sapi Meugang x 3 kg = Rp 540.000
   - Timphan (isi 50) x 2 = Rp 300.000
   Total: Rp 840.000
   Nama: Nur
   Ambil: 15 Feb 2027, 07:00–09:00
   Catatan: -
   ```
   Teks di-encode dengan `encodeURIComponent`, dan nomor WhatsApp hanya berisi angka.
5. **Kalkulator porsi (contoh ✏️, angka harus dari pemilik usaha):**
   - Masakan kenduri: 1 paket untuk 50 tamu, dibulatkan ke atas
   - Daging: 1 kg untuk 8 orang (untuk dimasak sendiri)
   - Kue: 2 pcs per tamu, sehingga jumlah kotak = ⌈tamu × 2 ÷ 50⌉

---

## 12. Keamanan (Security Review OWASP)

Hasil review ditulis di `docs/SECURITY-REVIEW.md`, dengan format per risiko:
**Risiko → Penerapan di proyek → Mitigasi → Status**.

| OWASP Top 10 (2021) | Penerapan dan mitigasi di proyek ini |
|---|---|
| A01 Broken Access Control | Route admin dijaga oleh pengecekan sesi. **Catatan jujur:** penjagaan di frontend bisa dilewati, tapi risikonya rendah karena tidak ada server, sehingga setiap pengunjung hanya bisa mengubah data di browsernya sendiri. |
| A02 Cryptographic Failures | Tidak ada data rahasia atau API key di kode. Tidak menyimpan password di localStorage. |
| A03 Injection (XSS) | React escaping; **dilarang** `dangerouslySetInnerHTML`, `innerHTML`, `eval`. Semua input divalidasi. Teks WhatsApp memakai `encodeURIComponent`. Unggahan SVG ditolak dan foto di-encode ulang lewat canvas. CSP ketat. |
| A04 Insecure Design | Threat model sederhana dicatat. Halaman admin diberi label **"MODE DEMO"** yang jelas. |
| A05 Security Misconfiguration | Header keamanan di `vercel.json`: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy. Target nilai **A** di securityheaders.com. |
| A06 Vulnerable Components | Library seminimal mungkin, `package-lock.json` di-commit, `npm audit` tanpa high/critical. |
| A07 Identification & Authentication Failures | `admin/admin` **diwajibkan tugas**, jadi risiko ini diterima dan diberi mitigasi: maks. 5 percobaan gagal lalu terkunci 5 menit, sesi di sessionStorage yang kedaluwarsa 30 menit, tombol keluar, label MODE DEMO. Dicatat bahwa untuk produksi harus diganti login sungguhan. |
| A08 Software & Data Integrity | Data localStorage bisa diubah lewat DevTools, sehingga **selalu divalidasi** saat dibaca (bagian 9.3). Tidak memakai script dari CDN tanpa SRI. |
| A09 Logging & Monitoring | Bug dan perbaikannya dicatat di `docs/DEBUG-LOG.md`. Tidak menampilkan data pribadi di console. |
| A10 SSRF | Tidak berlaku (tidak ada server). |

**Data pribadi:** nama, no HP, dan alamat pembeli hanya tersimpan di perangkat pembeli sendiri (localStorage).
Sediakan tombol "Hapus data saya" di halaman cek pesanan.

---

## 13. Pengujian (Vitest)

Logika diletakkan di `src/lib/` (fungsi murni) agar mudah diuji.

| Modul | Yang diuji |
|---|---|
| `format` | `formatRupiah(180000)` menghasilkan `"Rp 180.000"`; format satuan `/kg` benar |
| `validasi` | Produk/pesanan valid lolos; nama terlalu panjang, deskripsi > 150 karakter, harga negatif/desimal, kategori di luar daftar, no HP salah, dan teks `<script>` ditolak |
| `foto` | Hanya JPEG/PNG/WebP diterima, SVG ditolak, hitungan ukuran potong 4:3 benar |
| `storage` | Data rusak/JSON tidak valid kembali ke data awal tanpa crash; data valid terbaca benar; penyimpanan penuh ditangani |
| `katalog` | Pencarian, setiap filter, setiap sorting, dan kombinasinya |
| `keranjang` | Tambah/kurangi/hapus, total benar, tidak bisa melebihi sisa kuota |
| `kuota` | Pesanan mengurangi kuota; batal mengembalikan kuota; kuota tidak pernah negatif |
| `whatsapp` | URL pesan cepat berisi nama produk; URL pesan lengkap benar; teks ter-encode; nomor hanya angka |
| `kodePesanan` | Panjang dan format benar, tidak ada karakter ambigu |
| `kalkulator` | Pembulatan ke atas benar untuk 1, 49, 50, 51, dan 300 tamu |
| `auth` | `admin/admin` berhasil; salah 5x terkunci; sesi kedaluwarsa |
| `po` | Di luar jendela PO, pesanan lengkap ditolak |

**Target:** semua test lulus (`npm test`), cakupan (coverage) ≥ 70% untuk `src/lib/`.

---

## 14. Kriteria Sukses

- [ ] Kesembilan syarat minimum EKRAF terpenuhi (bagian 4)
- [ ] Keempat pilar katalog UMKM terpenuhi (bagian 5)
- [ ] Setiap produk punya tombol WhatsApp yang, dengan **1 ketukan**, membuka pesan berisi nama produk
- [ ] `npm test` lulus semua, coverage `src/lib/` ≥ 70%
- [ ] Pesan WhatsApp terbuka dengan isi yang benar di HP Android, iPhone, dan WhatsApp Web di laptop
- [ ] Tidak bisa memesan melebihi kuota atau di luar jendela PO
- [ ] Data localStorage yang dirusak tidak membuat aplikasi crash
- [ ] Rapi dan bisa dipakai penuh di kelima ukuran uji (bagian 10.1), tanpa scroll horizontal
- [ ] Lighthouse **mobile dan desktop**: Performance ≥ 90, Accessibility ≥ 90; halaman terbuka < 3 detik
- [ ] Semua pasangan warna teks/latar memenuhi kontras WCAG AA
- [ ] Orang awam bisa menambah satu produk baru di dashboard dalam < 2 menit tanpa dibantu
- [ ] securityheaders.com nilai **A**; `npm audit` tanpa high/critical
- [ ] `docs/SECURITY-REVIEW.md` dan `docs/DEBUG-LOG.md` terisi
- [ ] Live di `*.vercel.app`

---

## 15. Tahapan Pengerjaan (satu tahap = satu prompt = satu commit)

| # | Tahap | Commit |
|---|---|---|
| 1 | Setup Vite + React + TS + Vitest + `vercel.json` | `init: setup proyek` |
| 2 | **Fondasi desain:** palet warna (CSS variables), font, tata letak responsif dasar (header, footer, container) | `feat: fondasi desain & layout responsif` |
| 3 | Data 8 produk + standar data + storage tervalidasi + test | `feat: data produk & storage tervalidasi` |
| 4 | Landing page | `feat: landing page` |
| 5 | Katalog + kartu produk + **tombol WhatsApp per produk** + pencarian/filter/sorting + test | `feat: katalog, WhatsApp cepat, pencarian, filter, sorting` |
| 6 | Keranjang + kuota + form + WhatsApp lengkap + test | `feat: keranjang & pesan WhatsApp lengkap` |
| 7 | Kalkulator porsi + test | `feat: kalkulator porsi kenduri` |
| 8 | Login admin demo + test | `feat: login admin demo` |
| 9 | Dashboard CRUD produk & kuota (+ unggah foto, pratinjau kartu) | `feat: dashboard CRUD produk` |
| 10 | Pesanan + status + catat manual + rekap produksi | `feat: kelola pesanan & rekap` |
| 11 | Uji responsif di 5 ukuran + perbaikan | `fix: ...` |
| 12 | Security review OWASP + perbaikan | `docs: security review OWASP` + `fix: ...` |
| 13 | Uji akhir, deploy | `release: v1.0` |

**Perkiraan waktu:** sekitar 24–34 jam (bertambah sedikit karena tampilan laptop dan unggah foto).

---

## 16. Di Luar Cakupan (untuk pengembangan nanti)

- Pindah ke server/database (mis. Supabase) agar kuota dan pesanan **sungguhan** dan bisa dilihat penjual dari
  perangkat mana pun, serta login admin yang aman.
- Banyak UMKM (marketplace), pembayaran online, dan integrasi kurir.

---

## 17. Pertanyaan Terbuka ✏️

1. Nama UMKM dan lokasinya? Apakah ada UMKM sungguhan yang bisa jadi contoh?
2. Nomor WhatsApp untuk demo? (Jangan pakai nomor pribadi kalau web akan dibagikan publik.)
3. Apakah 8 produk dan harga di atas sudah sesuai? Mau diganti?
4. Hanya **ambil sendiri**, atau juga **antar**? Kalau antar, area mana dan berapa ongkirnya?
5. Berapa persen DP, dan bagaimana aturan jika pesanan tidak dibayar?
6. Slot waktu ambil yang tersedia (jam berapa saja)?
7. Angka kalkulator porsi yang benar menurut pemilik usaha?
8. Momen mana saja yang ditampilkan?
9. Palet "Rempah & Songket" sudah cocok, atau ada warna yang mau diganti?
10. Ornamen yang dipakai: motif **Pintu Aceh**, **Pucok Reubong**, atau yang lain?
