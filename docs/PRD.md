# PRD: Dalong Aceh, Pre-order Meugang & Kenduri

> **Status:** v1.0 · 24 November 2026 · sesuai website live **https://dalong-aceh.vercel.app**
> **Repo:** github.com/siddiqmifthahul/DalongAceh
>
> **Tanda status:** ✅ sudah jadi · 🟡 sebagian · ⏳ belum dikerjakan · ✏️ angka contoh, perlu dari pemilik usaha
>
> **Riwayat:**
> - v0.1: ide awal, fitur MoSCoW, syarat EKRAF.
> - v0.2: + 4 pilar katalog UMKM, tampilan responsif, palet "Rempah & Songket", standar data produk.
> - **v1.0:** disesuaikan dengan website yang sudah jadi. Nama resmi **Dalong Aceh**; data asli dipindah ke
>   **Supabase** (database, login penjual, foto); localStorage dipakai untuk keranjang dan mode demo;
>   desain ulang gaya restoran; domain `dalong-aceh.vercel.app`; pertanyaan terbuka dijawab (bagian 17).

---

## 0. Ringkasan

Website pre-order untuk **satu UMKM di Aceh** bernama **Dalong Aceh** (*dalong* = nampan berkaki untuk hidangan
kenduri Aceh) yang menjual **daging Meugang, masakan kenduri, dan kue tradisional**. Pembeli bisa melihat
8 produk, mencari, memfilter, dan mengurutkan produk, lalu memesan dengan dua cara:
1. **Pesan cepat:** satu ketukan tombol **"Pesan WA"** di kartu produk.
2. **Pesan lengkap:** lewat keranjang dengan jam ambil/antar, kode pesanan, dan kuota otomatis, lalu WhatsApp
   terbuka dengan pesan lengkap.

Pemilik usaha punya **dasbor** untuk mengelola produk (CRUD + foto), kuota, pesanan, **rekap produksi**, dan
pengaturan toko, tanpa bantuan teknis.

**Penyimpanan data:**
- **Data asli** (produk, pesanan, pengaturan, foto) ada di **Supabase**, dan aturannya ditegakkan di database.
- **localStorage dengan validasi** (syarat EKRAF) dipakai untuk **keranjang pembeli** dan **mode demo**
  (login `admin`/`admin`), sehingga juri bisa mencoba semua fitur tanpa menyentuh data asli.

---

## 1. Latar Belakang

- Menjelang **Meugang** (sebelum Ramadan, Idul Fitri, dan Idul Adha), hampir semua keluarga di Aceh membeli
  daging pada hari yang sama. Saat **kenduri** (Maulid, walimah), katering dan pembuat kue menerima pesanan besar.
- Pesanan UMKM masih dicatat lewat chat WhatsApp, sehingga:
  - pesanan **terlewat atau tercatat dobel**,
  - penjual **menerima pesanan melebihi kapasitas**,
  - penjual **tidak tahu total yang harus disiapkan** per hari (berapa kg daging, berapa kotak kue).
- Katalog produk masih tersebar di status WhatsApp dan sulit dicari pembeli.
- Pembeli tidak tahu apakah barang masih tersedia, dan bingung harus memesan berapa banyak untuk sekian tamu.

**Profil UMKM (contoh ✏️):** Dalong Aceh, usaha keluarga di Banda Aceh yang menjual daging Meugang, menerima
pesanan masakan kenduri, dan membuat kue tradisional. Produk, harga, dan kuota masih contoh.

---

## 2. Tujuan

### Tujuan tugas (wajib)
Memenuhi seluruh **Minimum Kerangka Prompt Project EKRAF** (bagian 4) dan **4 pilar katalog UMKM** (bagian 5). ✅

### Tujuan bisnis (terukur ✏️)
| Tujuan | Ukuran | Cara dicapai |
|---|---|---|
| Pesanan tercatat rapi | 100% pesanan punya kode unik, tidak ada pesanan dobel | Kode acak dibuat di database, kolom `kode` unik |
| Tidak ada overbooking | 0 pesanan melebihi kuota | Kuota dicek dan dikunci di database dalam satu transaksi |
| Rekap produksi cepat | Penjual tahu total produksi dalam < 1 menit | Halaman Rekap: total per produk dan per jam ambil |
| Pemesanan mudah | Pesan cepat 1 ketukan; pesan lengkap ≤ 3 menit dari HP | Tombol WA di setiap kartu; keranjang + form singkat |
| Mandiri | Penjual menambah produk baru sendiri dalam < 2 menit | Form produk dengan pratinjau kartu dan potong foto otomatis |

---

## 3. Target Pengguna

| Persona | Kebutuhan | Perangkat |
|---|---|---|
| **Kak Nur, ibu rumah tangga, 30–45 th** | Pesan daging Meugang tanpa antre, pasti kebagian | **HP**, lewat link di WhatsApp/Instagram |
| **Bang Rizal, panitia kenduri meunasah/kantor** | Tahu berapa banyak yang harus dipesan untuk 100–300 tamu | **HP dan laptop** kantor, membandingkan paket dan total harga |
| **Pemilik usaha (penjual)** | Atur kuota, lihat semua pesanan, tahu total yang harus dimasak | **HP** sehari-hari, **laptop** untuk rekap; tidak paham teknis |
| **Juri / penguji EKRAF** | Mencoba semua fitur, termasuk dasbor, tanpa merusak data | Laptop; login demo `admin`/`admin` |

---

## 4. Syarat Minimum EKRAF dan Cara Memenuhinya

| # | Syarat dari EKRAF | Cara dipenuhi | Status |
|---|---|---|---|
| 1 | Landing page dan **delapan produk** | Beranda (hero + countdown PO + Hidangan Andalan) dan bagian Menu berisi 8 produk (bagian 9.1) | ✅ |
| 2 | **Pencarian, filter, sorting** | Cari nama/deskripsi; pil kategori; panel "Saring produk" (momen, sembunyikan yang habis, harga maksimal); urutan harga, nama, sisa kuota | ✅ |
| 3 | **Integrasi WhatsApp untuk order** | Tombol "Pesan WA" di setiap produk **dan** keranjang dengan pesan lengkap + kode pesanan | ✅ |
| 4 | **Dashboard demo CRUD** | `/admin/produk`: tambah, lihat, ubah, hapus produk + unggah foto + pratinjau kartu | ✅ |
| 5 | **Admin dashboard, username `admin`, password `admin`** | Tab "Mode demo" di `/admin/login`, dengan mitigasi keamanan (bagian 12) | ✅ |
| 6 | **localStorage dengan validasi** | Keranjang dan data mode demo di localStorage; setiap data yang dibaca divalidasi skema dan dikembalikan ke data awal bila rusak (bagian 9.3) | ✅ |
| 7 | **Vitest dan unit test** | 13 file test, 83 test lulus (bagian 13) | ✅ |
| 8 | **Patch dan debugging terarah** | `docs/DEBUG-LOG.md`: gejala → penyebab → perbaikan → commit | ✅ |
| 9 | **Security review berdasarkan OWASP** | `docs/SECURITY-REVIEW.md` (OWASP Top 10 + temuan Supabase Security Advisor) | ✅ |

---

## 5. Empat Pilar Katalog UMKM (dari materi CHAT)

| Pilar | Isi menurut materi | Penerapan | Status |
|---|---|---|---|
| **1. Katalog & Pencarian** | Daftar produk dengan foto, harga, deskripsi singkat; pencarian dan filter kategori | Kartu berisi foto, kategori, nama, deskripsi 2–3 baris, harga + satuan, sisa kuota. Pencarian langsung, pil kategori, filter, dan sorting (M2–M5) | ✅ |
| **2. Tombol Pesan WhatsApp** | Setiap produk punya tombol pesan ke WhatsApp penjual, pesan otomatis berisi nama produk, **satu ketukan** | Tombol **"Pesan WA"** di setiap kartu. Jika kuota habis, tombol berubah menjadi **"Tanya stok"** dengan pesan yang menyesuaikan (M15) | ✅ |
| **3. Data Produk Konsisten** | Foto seragam, format harga jelas, deskripsi maks. 3 baris, kategori konsisten | Dipaksa oleh validasi form dan constraint database (bagian 9.4, M16) | ✅ |
| **4. Kriteria Sukses** | Ramah ponsel, cepat, mudah diperbarui sendiri | Responsif 360–1920 px, dasbor berbahasa sederhana dengan pratinjau kartu (M10, M17) | ✅ |

---

## 6. Daftar Fitur (MoSCoW)

### Must: wajib ada
| ID | Fitur | Keterangan | Status |
|---|---|---|---|
| M1 | **Landing page** | Hero dengan momen aktif + countdown PO, Hidangan Andalan (6 produk), Menu, kalkulator, cara pesan, footer kontak | ✅ |
| M2 | **Katalog 8 produk** | Kartu: foto, kategori, nama, deskripsi, harga + satuan, sisa kuota (progress bar), tombol Keranjang, tombol Pesan WA | ✅ |
| M3 | **Pencarian** | Nama dan deskripsi, tidak peka huruf besar/kecil, hasil langsung berubah | ✅ |
| M4 | **Filter** | Kategori (pil), momen, sembunyikan yang habis, harga maksimal | ✅ |
| M5 | **Sorting** | Urutan bawaan, harga termurah, harga termahal, nama A–Z, sisa kuota terbanyak | ✅ |
| M6 | **Keranjang** | Laci samping: tambah/kurangi/hapus item, total otomatis, tersimpan di localStorage tervalidasi | ✅ |
| M7 | **Form pesanan lengkap + WhatsApp** | Nama, no. WA, cara terima (ambil di dapur / diantar + alamat), jam ambil/antar, catatan; tervalidasi; pesanan tersimpan lalu WhatsApp penjual terbuka dengan kode pesanan | ✅ |
| M8 | **Kuota produk** | Tombol tambah mati bila habis; jumlah di keranjang tidak bisa melebihi sisa; dicek ulang di database | ✅ |
| M9 | **Login admin** | Dua jalur: **penjual** (Supabase Auth, email + password kuat) dan **mode demo** `admin`/`admin` (batas percobaan, sesi 30 menit) | ✅ |
| M10 | **Dasbor CRUD produk** | Tambah, ubah, hapus, aktif/nonaktif, atur kuota; validasi form; unggah foto; **pratinjau kartu** sebelum disimpan | ✅ |
| M11 | **Daftar pesanan** | Lihat pesanan, ubah status: Baru → DP → Lunas → Diambil, atau Batal (kuota kembali otomatis) | ✅ |
| M12 | **localStorage tervalidasi** | Keranjang dan data demo divalidasi saat dibaca dan ditulis | ✅ |
| M13 | **Unit test (Vitest)** | Lihat bagian 13 | ✅ |
| M14 | **Security review OWASP** | Lihat bagian 12 | ✅ |
| M15 | **Tombol WhatsApp di setiap produk** (pilar 2) | Satu ketukan, pesan berisi nama produk dan harga. Saat habis: "Tanya stok" | ✅ |
| M16 | **Standar data produk konsisten** (pilar 3) | Foto dipotong otomatis 4:3, format `Rp 180.000`, deskripsi 10–150 karakter, kategori dari daftar tetap (bagian 9.4) | ✅ |
| M17 | **Responsif HP & laptop** | 360–1920 px, termasuk dasbor (bagian 10.1) | ✅ |
| M18 | **Palet warna & identitas visual** | Palet "Rempah & Songket" + gaya visual bagian 10.3 | ✅ |
| M19 | **Database & login penjual sungguhan** *(baru di v1.0)* | Supabase: Postgres + Row Level Security + Auth + Storage foto. Aturan kuota, jendela PO, slot, anti-spam, dan hak admin ditegakkan **di database** | ✅ |

### Should: sangat disarankan
| ID | Fitur | Keterangan | Status |
|---|---|---|---|
| S1 | **Kalkulator porsi kenduri** | Jumlah tamu (10–500) + pilihan masakan/kue/daging → rekomendasi jumlah + total, lalu satu klik masuk keranjang | ✅ |
| S2 | **Rekap produksi** | Total per produk dan per jam ambil, misalnya "Daging sapi: 46 kg" | ✅ |
| S3 | **Pengaturan toko** | Nama usaha, no. WhatsApp, label momen, tanggal tutup PO, daftar jam ambil/antar | ✅ |
| S4 | **Cek pesanan** | Pembeli memasukkan kode pesanan + 4 angka terakhir no. WA, lalu melihat status, metode, jam, dan total **dari perangkat mana pun** (nama dan nomor tidak ditampilkan) | ✅ |
| S5 | **Reset data demo** | Mengembalikan data mode demo ke kondisi awal, berguna saat presentasi | ✅ |
| S6 | **Catat pesanan manual** | Penjual mencatat pesanan yang masuk lewat WA cepat agar ikut terhitung di kuota dan rekap | ⏳ (struktur data sudah siap: `sumber: "manual"`) |

### Could: kalau waktu masih ada
| ID | Fitur | Status |
|---|---|---|
| C1 | Pengingat ke kalender HP (file `.ics`) untuk jadwal ambil | ⏳ |
| C2 | Pilihan Bahasa Aceh / Indonesia | ⏳ |
| C3 | Ekspor rekap/pesanan ke file CSV | ⏳ |
| C4 | Mode gelap | ⏳ |
| C5 | Tombol "Hapus data saya" untuk pembeli (keranjang lokal + permintaan hapus pesanan) | ⏳ (keranjang bisa dikosongkan; penghapusan pesanan di database lewat permintaan ke penjual via WA) |

### Won't: tidak di versi ini
- Pembayaran online di dalam website. DP dan pelunasan lewat WhatsApp; nomor rekening **hanya dikirim penjual lewat WA**.
- Nomor WA pembeli terbaca otomatis lewat WhatsApp Business API (butuh verifikasi Meta, nomor khusus, dan biaya).
  Diputuskan: pembeli tetap mengetik nomor di form.
- Banyak UMKM (marketplace) dan integrasi kurir.

---

## 7. Alur Pengguna

### Pembeli: pesan cepat (1 ketukan)
```
Lihat kartu produk → ketuk "Pesan WA"
  → WhatsApp terbuka: "Assalamu'alaikum, saya mau pesan Daging Sapi Meugang (Rp 180.000/kg).
                       Apakah masih tersedia?"
```

### Pembeli: pesan lengkap
```
Buka web → hero (momen aktif + countdown PO)
  → Menu: cari / pil kategori / saring / urutkan        (atau Hidangan Andalan → ikon troli)
  → (opsional) Hitung Porsi: "kenduri 150 tamu" → rekomendasi → masuk keranjang
  → keranjang → isi form (nama, no. WA, ambil/antar, jam, catatan)
  → validasi di browser
  → database (fungsi buat_pesanan): cek PO, slot, isi pesanan, anti-spam, kunci & cek kuota
  → kode pesanan dibuat, kuota berkurang, pesanan tersimpan
  → WhatsApp terbuka dengan pesan lengkap siap kirim ke penjual
  → penjual membalas lewat WA dengan info DP
  → (kapan saja) Cek Pesanan: kode + 4 angka terakhir no. WA → status pesanan
```

### Penjual
```
/admin/login → tab "Penjual" (email + password) → dasbor
  → Ringkasan: pesanan aktif, belum dikonfirmasi, produk hampir/sudah habis, nilai pesanan aktif
  → Produk: tambah / ubah / hapus / aktifkan / atur kuota (dengan pratinjau kartu + potong foto otomatis)
  → Pesanan: lihat detail, ubah status Baru → DP → Lunas → Diambil, atau Batal (kuota kembali)
  → Rekap: total produksi per produk dan per jam ambil
  → Pengaturan: nama usaha, no. WA, momen, tanggal tutup PO, jam ambil/antar
  → Keluar
```

### Juri (mode demo)
```
/admin/login → tab "Mode demo" → admin / admin
  → dasbor yang sama, tetapi data di localStorage browser juri (label "Mode demo")
  → maks. 5 percobaan salah → terkunci 5 menit; sesi berakhir otomatis setelah 30 menit
  → Pengaturan → "Reset data demo" untuk kembali ke data awal
```

---

## 8. Halaman

Toko dibuat sebagai **satu halaman** dengan bagian-bagian yang bisa dituju dari menu (lebih cepat di HP dan
mudah dibagikan). Halaman detail produk terpisah (`/produk/:id`) dari v0.2 tidak dibuat; semua informasi
produk sudah ada di kartu.

| Rute / bagian | Isi | Akses |
|---|---|---|
| `/` → `#top` (Beranda) | Hero: momen aktif, countdown PO, tombol "Lihat Menu" dan "Hitung Porsi" | Publik |
| `/` → `#andalan` | Hidangan Andalan: 6 produk melingkar (laptop) atau grid (HP), tombol troli | Publik |
| `/` → `#produk` (Menu) | Pil kategori, saring, cari, urutkan, kartu produk | Publik |
| `/` → `#kalkulator` | Hitung Porsi Kenduri | Publik |
| `/` → `#cek-pesanan` | Cara pesan (3 langkah) + Cek Pesanan | Publik |
| Laci keranjang | Keranjang + form pesanan, dibuka dari ikon troli di header | Publik |
| `/admin/login` | Login penjual (Supabase Auth) dan tab Mode demo | Publik |
| `/admin` | Ringkasan | Penjual / demo |
| `/admin/produk` | CRUD produk + kuota + foto | Penjual / demo |
| `/admin/pesanan` | Daftar pesanan + ubah status | Penjual / demo |
| `/admin/rekap` | Rekap produksi | Penjual / demo |
| `/admin/pengaturan` | Pengaturan toko, reset data demo | Penjual / demo |
| `*` | Halaman tidak ditemukan | Publik |

---

## 9. Data

### 9.1 Delapan produk awal (contoh ✏️)

| # | Nama | Kategori | Satuan | Harga | Kuota | Momen |
|---|---|---|---|---|---|---|
| 1 | Daging Sapi Meugang | Daging Meugang | kg | Rp 180.000 | 100 | Meugang |
| 2 | Daging Kerbau Meugang | Daging Meugang | kg | Rp 190.000 | 60 | Meugang |
| 3 | Sie Reuboh | Daging Meugang | kg | Rp 220.000 | 30 | Meugang |
| 4 | Paket Kuah Beulangong (50 porsi) | Masakan Kenduri | paket | Rp 2.500.000 | 8 | Kenduri |
| 5 | Paket Kari Kambing Aceh (50 porsi) | Masakan Kenduri | paket | Rp 2.800.000 | 6 | Kenduri |
| 6 | Timphan (isi 50) | Kue Tradisional | kotak | Rp 150.000 | 40 | Meugang, Kenduri |
| 7 | Kue Bhoi (isi 50) | Kue Tradisional | kotak | Rp 125.000 | 40 | Meugang, Kenduri |
| 8 | Keukarah (1 kotak) | Kue Tradisional | kotak | Rp 60.000 | 50 | Meugang, Kenduri |

**Momen** disederhanakan dari v0.2 menjadi dua: **Meugang** dan **Kenduri**. Momen yang sedang berjalan ditulis di
pengaturan sebagai label, saat ini **"Meugang Ramadan 2027"** ✏️.

**Pengaturan awal ✏️:** PO ditutup Jumat, 5 Februari 2027 pukul 18.00 WIB; jam ambil/antar:
Sabtu 6 Feb 05.30–07.30, Sabtu 6 Feb 07.30–09.30, Minggu 7 Feb 05.30–07.30.

Foto produk berasal dari Wikimedia Commons (lisensi bebas); kreditnya ditampilkan di footer.

### 9.2 Struktur data

**Database Supabase** (`supabase/migrations/`):

| Tabel | Isi | Siapa boleh membaca / menulis |
|---|---|---|
| `produk` | Data produk + `kuota` dan `terpesan` | Baca: semua orang (hanya produk aktif). Tulis: penjual |
| `pengaturan` | Satu baris pengaturan toko | Baca: semua orang. Tulis: penjual |
| `pesanan` | Kode, nama, no. HP, metode, alamat, slot, catatan, status, total, sumber | Hanya penjual. Pembeli membuat lewat fungsi `buat_pesanan` dan mengecek lewat `cek_pesanan` |
| `pesanan_item` | Item setiap pesanan (nama, jumlah, harga satuan saat dipesan) | Hanya penjual |
| `admins` | Daftar akun penjual | Tidak bisa dibaca publik |
| Storage `foto-produk` | Foto produk (WebP/JPEG/PNG, maks. 1 MB) | Baca: publik. Unggah/hapus: penjual |

**Tipe di kode** (`src/lib/types.ts`):

```ts
Produk {
  id, urutan
  nama: string          // 3–60 karakter
  kategori: "daging" | "masakan" | "kue"
  satuan: "kg" | "paket" | "kotak"
  harga: number         // bilangan bulat, 1.000 – 50.000.000
  deskripsi: string     // 10–150 karakter
  ciri: string[]        // maks. 3, masing-masing ≤ 16 karakter
  foto: string | null   // /img/..., URL Storage, atau data URL WebP (mode demo)
  fokus: string         // titik fokus foto, mis. "50% 40%"
  momen: ("meugang" | "kenduri")[]
  kuota: number         // 1 – 10.000, tidak boleh kurang dari terpesan
  terpesan: number
  aktif: boolean
}

Pesanan {
  kode: string          // "MK-" + 8 karakter acak
  waktu, sumber: "web" | "manual"
  nama: string          // 2–50 karakter huruf
  noHp: string          // disimpan sebagai 628xxxxxxxxx
  metode: "ambil" | "antar"
  alamat: string | null // wajib jika antar, 10–200 karakter
  slot: string          // harus salah satu jam di pengaturan
  catatan: string | null// maks. 200 karakter
  status: "baru" | "dp" | "lunas" | "diambil" | "batal"
  items: { produkId, nama, jumlah, hargaSatuan, satuan }[]
  total: number
}

Pengaturan { namaUsaha, noWhatsApp, momenLabel, poTutup, slots[] }
```

### 9.3 Penyimpanan di browser (localStorage) + validasi

Dua sumber data memakai **antarmuka kode yang sama** (`src/services/types.ts`):
- `live.ts`: Supabase, untuk pembeli dan penjual sungguhan.
- `demo.ts`: localStorage, untuk mode demo dan otomatis dipakai bila Supabase belum dikonfigurasi.

Aturan:
- **Kunci berversi:** `mk:v1:produk`, `mk:v1:pesanan`, `mk:v1:pengaturan` (data demo) dan `mk:v1:keranjang`.
- **Validasi saat MEMBACA:** `JSON.parse` di dalam `try/catch`, lalu dicek tipe, rentang, panjang, dan enum.
  Jika rusak atau diubah lewat DevTools, data dikembalikan ke data awal dan aplikasi **tidak crash** (diuji).
- **Validasi saat MENULIS:** data dari form divalidasi dulu; yang tidak valid ditolak dengan pesan jelas.
- Sesi mode demo di **sessionStorage**, berlaku 30 menit.
- Tidak ada password, token, atau rahasia di localStorage. Data pribadi pembeli tidak disimpan di localStorage.

### 9.4 Standar data produk (pilar 3), dipaksa oleh validasi

| Aspek | Standar | Cara memaksa |
|---|---|---|
| **Foto** | 4:3, 800 × 600 px, WebP | Foto unggahan otomatis **dipotong ke tengah, diperkecil, dan di-encode ulang** di browser (canvas). Hanya JPEG/PNG/WebP; **SVG ditolak**; metadata EXIF (mis. lokasi GPS) terbuang. Di kartu, foto ditampilkan bulat dengan titik fokus yang bisa diatur |
| **Harga** | `Rp 180.000` + satuan `/kg`, `/paket`, `/kotak` | Satu fungsi format rupiah dipakai di semua tempat; input hanya angka bulat |
| **Deskripsi** | 10–150 karakter, tampil maks. 3 baris | Validasi panjang + penghitung karakter + CSS `line-clamp` |
| **Nama** | 3–60 karakter | Validasi panjang, tanpa tanda `<` `>` |
| **Kategori & satuan** | Daftar tetap | Dipilih dari dropdown, juga dicek oleh constraint database |
| **Kuota** | 1–10.000, tidak kurang dari yang sudah terpesan | Validasi form + constraint database |

---

## 10. Desain & Tampilan

### 10.1 Responsif: HP dan laptop (M17)

Dirancang **mobile-first**, lalu melebar untuk tablet dan laptop.

| Ukuran layar | Toko | Dasbor |
|---|---|---|
| **HP** 360–767 px | Menu hamburger; Hidangan Andalan sebagai grid; pil kategori bisa digeser; kartu 1–2 kolom; filter dalam lembar dari bawah | Menu di bawah layar |
| **Tablet** 768–1023 px | Kartu 2–3 kolom | Menu menyesuaikan |
| **Laptop** ≥ 1024 px | Menu di header dengan garis emas mengikuti posisi gulir; Hidangan Andalan melingkar di elips emas; pil kategori di kolom kiri, kartu di kanan | Menu samping tetap |

Aturan wajib:
- Tidak ada scroll horizontal di ukuran mana pun.
- Area sentuh minimal **44 × 44 px**.
- Semua fitur bisa dipakai dengan **keyboard** (Tab, Enter, Esc menutup laci/panel), fokus terlihat jelas.
- Menghormati `prefers-reduced-motion`.
- **Ukuran uji:** 360×800, 390×844, 768×1024, 1366×768, 1920×1080.

### 10.2 Palet warna: "Rempah & Songket" (M18)

Palet diambil dari **apa yang ada di sebuah kenduri Aceh**: daging Meugang, rempah kuah beulangong,
daun pisang alas hidangan, kayu bakar di bawah kuali besar, dan benang emas songket.
Pesannya: **hangat, meriah, penuh syukur, dan berakar pada tradisi Aceh.**

| Peran | Nama | Hex | Makna | Dipakai untuk |
|---|---|---|---|---|
| **Utama** | Merah Meugang | `#8E1B1B` | Daging Meugang, merah ornamen adat Aceh | Header, hero, footer, judul |
| **Aksen** | Kuning Kunyit | `#D9A21B` | Rempah kuah beulangong + benang emas songket | Garis emas, bingkai, tombol "Keranjang", badge |
| **Pendukung** | Hijau Daun Pisang | `#2F6B3A` | Daun pisang alas hidangan kenduri | **Tombol WhatsApp**, status tersedia |
| **Teks** | Hitam Kayu Arang | `#1F1A17` | Kayu bakar, kain hitam pakaian adat | Teks utama |
| **Latar** | Krem Santan | `#FBF5EA` | Santan dan nasi kenduri | Latar halaman |
| **Teks redup** | Cokelat Rempah | `#6B5E55` | | Deskripsi, label |
| **Garis** | Pasir | `#E8DCC8` | | Border, pemisah |
| **Error** | Merah Bata | `#B42318` | | Pesan error (selalu dengan teks) |

**Turunan palet** (versi lebih muda/tua dari warna di atas, dipakai pada desain v1.0): Merah tua `#6E1414`,
Kunyit tua `#C8930F`, Kunyit gelap `#8A5E08` (teks emas di atas krem), Emas muda `#F3DFA6`, Krem kartu `#FFFDF8`,
Krem isian `#FFF7E6`, Garis isian `#E6D0A0`, Hijau tua `#245530`.

**Kontras (WCAG AA ≥ 4,5:1):** teks putih di atas Merah Meugang ≈ 9 : 1 ✅ · teks putih di atas Hijau ≈ 6,4 : 1 ✅ ·
teks hitam di atas Kuning Kunyit ≈ 7,5 : 1 ✅ · Cokelat Rempah di atas Krem ≈ 5,7 : 1 ✅.
**Tidak pernah** teks putih di atas Kuning Kunyit.

Semua warna disimpan sebagai **CSS variables**. Status tidak dibedakan hanya dengan warna (selalu ada teks, mis. "Habis").

### 10.3 Gaya visual (desain ulang v1.0)

Mengikuti referensi **restoran mewah**, tetap dengan palet di atas:
- **Huruf:** judul **Playfair Display** (serif elegan), isi **Plus Jakarta Sans**. Keduanya di-*self-host* lewat
  npm (`@fontsource`), sesuai CSP `font-src 'self'`.
- **Hero** merah dengan foto bulat kuah beulangong berbingkai busur emas dan **belah ketupat** emas; tepi bawah bergelombang.
- **Hidangan Andalan:** foto-foto bulat mengelilingi elips emas.
- **Menu:** pil kategori berfoto di kiri, judul kategori + tagline miring, kartu dengan foto bulat.
- **Hitung Porsi** dalam banner berbingkai emas.
- **Footer** merah bergelombang dengan garis emas.
- Ornamen budaya: belah ketupat emas, motif **Pintu Aceh** samar di hero, pita **pucok reubong**.

---

## 11. Aturan Bisnis

Semua aturan di bawah **ditegakkan di database** (fungsi `buat_pesanan`, trigger, constraint), bukan hanya di browser.

1. **Kuota:** saat pesanan dibuat, baris produk **dikunci** (`select … for update`), kuota dicek, lalu `terpesan`
   bertambah. Dua pembeli tidak bisa merebut stok terakhir bersamaan. Jika status menjadi **Batal**, kuota kembali
   otomatis lewat trigger. Jumlah di keranjang tidak boleh melebihi `kuota − terpesan`.
2. **Jendela PO:** setelah `poTutup`, pesanan lengkap ditolak dan tombol pesan nonaktif. Tombol "Pesan WA" cepat
   tetap aktif untuk bertanya.
3. **Jam ambil/antar:** harus salah satu slot di pengaturan.
4. **Kode pesanan:** `MK-` + 8 karakter dari `crypto.getRandomValues`, tanpa huruf yang membingungkan (O/0, I/1).
5. **Anti-spam:** maks. **5 pesanan per nomor per jam** dan **60 pesanan per menit** untuk seluruh toko.
6. **Status pesanan:** Baru (menunggu konfirmasi) → DP diterima → Lunas → Sudah diambil, atau Dibatalkan.
7. **Pembayaran:** DP dan pelunasan lewat WhatsApp. Website **tidak pernah** meminta atau menyimpan nomor rekening.
8. **Format pesan WhatsApp:**

   **a. Pesan cepat (tombol di setiap produk):**
   ```
   Assalamu'alaikum, saya mau pesan Daging Sapi Meugang (Rp 180.000/kg).
   Apakah masih tersedia?
   ```
   Jika kuota habis: "Assalamu'alaikum, apakah Daging Sapi Meugang masih bisa dipesan? Di web tertulis kuotanya sudah habis."

   **b. Pesan lengkap (dari keranjang):**
   ```
   Assalamu'alaikum, saya mau pesan (Meugang Ramadan 2027)
   Kode: MK-7Q4XK2PD
   - Daging Sapi Meugang x 3 kg = Rp 540.000
   - Timphan (isi 50) x 2 kotak = Rp 300.000
   Total: Rp 840.000
   Nama: Nur
   No. WA: 0812-3456-7890
   Ambil: Sabtu, 6 Feb 2027, 05.30–07.30
   Alamat: …            (hanya jika diantar)
   Catatan: -
   ```
   Teks di-encode dengan `encodeURIComponent`, nomor WhatsApp hanya berisi angka. Baris "No. WA" sengaja
   dipertahankan karena pemesan bisa berbeda dengan pengirim pesan.
9. **Kalkulator porsi (contoh ✏️, angka asli dari pemilik usaha):**
   - Jumlah tamu 10–500.
   - Masakan kenduri: 1 paket untuk 50 tamu, dibulatkan ke atas.
   - Kue: 2 buah per tamu, isi 50 per kotak, sehingga kotak = ⌈tamu × 2 ÷ 50⌉.
   - Daging (opsional): 1 kg untuk 8 orang, dibulatkan ke atas.
   - Jika rekomendasi melebihi sisa kuota, muncul peringatan dan jumlah yang masuk keranjang dibatasi kuota.

---

## 12. Keamanan (Security Review OWASP)

Hasil lengkap ada di `docs/SECURITY-REVIEW.md`; panduan untuk pemilik di `docs/PANDUAN-KEAMANAN.md`.

| OWASP Top 10 (2021) | Penerapan di proyek ini | Status |
|---|---|---|
| A01 Broken Access Control | **Row Level Security** di semua tabel; tulis hanya jika `private.is_admin()`. Pembeli tidak bisa membaca tabel pesanan, hanya memanggil `buat_pesanan` / `cek_pesanan`. Diuji dengan 10 percobaan akses ilegal, semuanya ditolak | ✅ |
| A02 Cryptographic Failures | HTTPS + HSTS. Password dikelola Supabase Auth. Di frontend hanya kunci publik (publishable) dari Environment Variables Vercel; kode menolak kunci `service_role`/`secret` | ✅ |
| A03 Injection | React escaping; dilarang `innerHTML`/`eval`; validasi di form **dan** constraint database; query berparameter; `encodeURIComponent` untuk WA; CSP ketat | ✅ |
| A04 Insecure Design | Kuota atomik di database, jendela PO & slot dicek server, anti-spam, label "Mode demo" | ✅ |
| A05 Security Misconfiguration | 8 header keamanan di `vercel.json` (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP); pendaftaran akun publik dimatikan; bucket foto dibatasi tipe & ukuran | ✅ |
| A06 Vulnerable Components | Library minimal, `package-lock.json` di-commit, `npm audit` 0 kerentanan | ✅ |
| A07 Authentication Failures | `admin`/`admin` **diwajibkan tugas**: risiko diterima, hanya membuka mode demo, maks. 5 percobaan → terkunci 5 menit, sesi 30 menit. Login penjual: password ≥ 12 karakter + kombinasi, 10 percobaan / 5 menit. Proteksi password bocor hanya di paket Pro | ⚠️ Diterima (demo) |
| A08 Data Integrity | localStorage divalidasi setiap dibaca; foto di-encode ulang, SVG ditolak; tanpa script CDN | ✅ |
| A09 Logging & Monitoring | Galat disaring untuk pengguna; log Supabase; `docs/DEBUG-LOG.md` | ✅ |
| A10 SSRF | Tidak ada fitur server yang mengambil URL dari input | ✅ Tidak berlaku |

**Pengaman proses:** `npm run cek:semua` (typecheck, test, pemindai rahasia, `npm audit`) sebelum commit;
GitHub Push Protection; eksperimen di branch `coba/*` (Preview Vercel); push hanya dengan izin pemilik.

**Data pribadi:** nama, no. WA, dan alamat pembeli tersimpan di database dan hanya bisa dibaca penjual.
Cek Pesanan tidak menampilkan nama atau nomor.

---

## 13. Pengujian (Vitest)

Logika ditulis sebagai fungsi murni di `src/lib/` agar mudah diuji. **13 file test, 83 test, semua lulus.**

| File test | Yang diuji |
|---|---|
| `format` | `Rp 180.000`, harga + satuan, merapikan teks, countdown |
| `validasi` | Form pesanan & produk: batas panjang, harga bulat, kategori, no. HP, slot, tanda `<script>` ditolak |
| `storage` | JSON rusak / data diubah kembali ke data awal tanpa crash |
| `katalog` | Pencarian, setiap filter, setiap urutan, kombinasinya, hitungan per momen |
| `keranjang` | Tambah/kurangi/hapus, total, tidak melebihi sisa kuota |
| `whatsapp` | Normalisasi & format nomor WA, pesan cepat & lengkap, teks ter-encode, nomor hanya angka |
| `kode` | Format `MK-` + 8 karakter, tanpa karakter ambigu |
| `kalkulator` | Pembulatan ke atas, batas 10–500 tamu, pilihan "tidak pesan" |
| `authDemo` | `admin`/`admin` berhasil, 5 kali salah terkunci, sesi kedaluwarsa |
| `kunci` | Kunci `service_role`/`secret` ditolak, URL Supabase divalidasi |
| `rahasia` | Pemindai rahasia mendeteksi pola kunci/password |
| `konfigurasi` | Konfigurasi `vercel.json` (rewrite + header keamanan) |
| `demo` (services) | Sumber data mode demo: CRUD produk, pesanan, kuota, batal mengembalikan kuota |

Perintah: `npm test` (unit test) dan `npm run cek:semua` (semua pemeriksaan).

---

## 14. Kriteria Sukses

- [x] Kesembilan syarat minimum EKRAF terpenuhi (bagian 4)
- [x] Keempat pilar katalog UMKM terpenuhi (bagian 5)
- [x] Setiap produk punya tombol WhatsApp yang, dengan **1 ketukan**, membuka pesan berisi nama produk
- [x] `npm test` lulus semua (83 test)
- [ ] Cakupan (coverage) `src/lib/` ≥ 70% — belum diukur
- [x] Pesan WhatsApp terbuka dengan isi yang benar (dicek di WhatsApp Web laptop)
- [ ] Dicek juga di HP Android dan iPhone
- [x] Tidak bisa memesan melebihi kuota atau di luar jendela PO (ditegakkan database)
- [x] Data localStorage yang dirusak tidak membuat aplikasi crash
- [x] Rapi di kelima ukuran uji, tanpa scroll horizontal
- [ ] Lighthouse mobile & desktop: Performance ≥ 90, Accessibility ≥ 90 — belum diukur
- [x] Semua pasangan warna teks/latar memenuhi kontras WCAG AA
- [ ] Orang awam bisa menambah produk baru di dasbor dalam < 2 menit — perlu diuji dengan pemilik usaha
- [x] 8 header keamanan aktif; `npm audit` tanpa kerentanan
- [ ] Nilai **A** di securityheaders.com — perlu dicek di URL live
- [x] `docs/SECURITY-REVIEW.md` dan `docs/DEBUG-LOG.md` terisi
- [x] Live di **https://dalong-aceh.vercel.app** (alamat lama `pesan-meugang.vercel.app` dialihkan permanen)

---

## 15. Tahapan Pengerjaan

Setiap tahap = satu tugas untuk AI agent = satu commit (`init:` / `feat:` / `fix:` / `test:` / `docs:` / `release:`).

| # | Tahap | Status |
|---|---|---|
| 1 | Setup Vite + React + TS + Vitest + `vercel.json` | ✅ |
| 2 | Fondasi desain: palet, font, tata letak responsif | ✅ |
| 3 | Data 8 produk + standar data + storage tervalidasi + test | ✅ |
| 4 | Landing page | ✅ |
| 5 | Katalog + tombol WA per produk + pencarian/filter/sorting + test | ✅ |
| 6 | Keranjang + kuota + form + WA lengkap + test | ✅ |
| 7 | Kalkulator porsi + test | ✅ |
| 8 | Login admin demo + test | ✅ |
| 9 | Dasbor CRUD produk (+ unggah foto, pratinjau kartu) | ✅ |
| 10 | Pesanan + status + rekap produksi | ✅ (catat pesanan manual ⏳) |
| 11 | **Supabase:** skema, RLS, fungsi pesanan, login penjual, Storage foto | ✅ |
| 12 | Uji responsif + perbaikan | ✅ |
| 13 | Security review OWASP + pengamanan Supabase + pemindai rahasia | ✅ |
| 14 | Rilis v1.0 ke Vercel (kunci di Environment Variables) | ✅ (tag `v1.0`) |
| 15 | Desain ulang gaya restoran + nama **Dalong Aceh** (lewat branch `coba/desain-dalong` → Preview → main) | ✅ |
| 16 | Domain `dalong-aceh.vercel.app`, repo `DalongAceh` | ✅ |

---

## 16. Pengembangan Berikutnya

- **S6** Catat pesanan manual dari WhatsApp cepat.
- **C5** Tombol "Hapus data saya" untuk pembeli.
- Mencegah penimbunan kuota oleh pesanan palsu (mis. pesanan "Baru" otomatis batal jika DP tidak masuk dalam X jam).
- Verifikasi dua langkah untuk login penjual; proteksi password bocor (paket Pro Supabase).
- Ekspor CSV, pengingat kalender, Bahasa Aceh, mode gelap (C1–C4).
- Jangka panjang: WhatsApp Business API, pembayaran online, banyak UMKM, integrasi kurir.

---

## 17. Keputusan & Pertanyaan Terbuka

### Sudah diputuskan
| Pertanyaan v0.2 | Keputusan |
|---|---|
| Nama UMKM | **Dalong Aceh** (tanpa nama orang), subjudul "Meugang & Kenduri" |
| Nomor WhatsApp | 0822-6145-1487, bisa diubah di dasbor → Pengaturan |
| 8 produk dan harga | Memakai daftar di bagian 9.1 (contoh ✏️) |
| Ambil sendiri atau antar | **Keduanya.** Antar wajib isi alamat; ongkir dibicarakan lewat WA |
| Slot waktu ambil | 3 slot contoh (bagian 9.1), diatur di dasbor |
| Momen | Meugang dan Kenduri; momen berjalan: Meugang Ramadan 2027 |
| Palet | "Rempah & Songket" tetap; bagian gelap memakai Merah Meugang |
| Ornamen | Belah ketupat emas, motif Pintu Aceh, pita pucok reubong |
| Nomor WA otomatis dari WhatsApp | Tidak; pembeli tetap mengetik nomor (bagian 6, Won't) |
| Database | **Supabase** (dari v1.0), bukan hanya localStorage |

### Masih terbuka ✏️
1. Apakah ada UMKM sungguhan yang bisa menjadi contoh (produk, harga, kuota asli)?
2. Berapa persen DP, dan bagaimana aturan jika pesanan tidak dibayar?
3. Area antar dan besaran ongkir?
4. Angka kalkulator porsi yang benar menurut pemilik usaha?
