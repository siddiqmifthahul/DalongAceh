# Debug Log: Patch & Debugging Terarah

Format setiap entri: **Gejala → Penyebab → Perbaikan → Bukti/commit**.

---

### 1. Tinggi foto di kartu katalog tidak seragam
- **Gejala:** setelah placeholder diganti foto asli, foto daging sapi lebih tinggi daripada foto daging kerbau, sehingga kartu tidak sejajar.
- **Penyebab:** `<img>` di dalam `.card-media` (aspect-ratio 4:3) ikut memakai rasio asli foto karena ukuran minimum konten mengalahkan `aspect-ratio`.
- **Perbaikan:** `.card-media{overflow:hidden}` dan `img{position:absolute; inset:0; object-fit:cover}`, ditambah `object-position` per produk (`fokus`).
- **Bukti:** screenshot laptop dan HP, semua kartu 4:3. Commit `cea9454`.

### 2. Hero kosong di beberapa perangkat
- **Gejala:** di screenshot HP, judul dan tombol hero tidak terlihat.
- **Penyebab:** kelas `.rise` memakai `opacity:0` bawaan dan baru terlihat setelah animasi selesai. Jika animasi tertunda, konten tetap tidak terlihat.
- **Perbaikan:** hapus `opacity:0` bawaan dan pakai `animation-fill-mode: both`. Tanpa animasi, konten tetap tampil.
- **Bukti:** screenshot HP setelah perbaikan. Commit `cea9454`.

### 3. Lembar filter di HP tertutup lapisan gelap dan tidak bisa disentuh
- **Gejala:** saat tombol Filter ditekan di HP, panel muncul redup dan tidak merespons sentuhan.
- **Penyebab:** `isolation:isolate` pada `.katalog-bg` (untuk motif Pintu Aceh) membuat *stacking context* baru, sehingga `z-index:60` panel terkurung di bawah backdrop `z-index:55`.
- **Perbaikan:** hapus `isolation` dari `.katalog-bg`.
- **Bukti:** uji `elementFromPoint` di panel, hasilnya `HIT=true` (sebelumnya tertutup). Commit `220df91`.

### 4. Fungsi "tambah ke keranjang" bisa melaporkan 0 item ditambahkan
- **Gejala (ditemukan saat review kode):** toast bisa salah menampilkan "kuota sudah maksimal" walau item berhasil ditambah. Kalkulator porsi juga bisa salah menghitung item yang dibatasi kuota.
- **Penyebab:** nilai `ditambah` diisi di dalam *callback* `setState`, padahal React bisa menjalankannya belakangan (batched), sehingga yang dikembalikan masih 0.
- **Perbaikan:** hitung langsung dari `itemsRef.current` (keadaan terbaru), baru panggil `setItems`.
- **Bukti:** uji manual di Chrome. Badge keranjang 2 setelah dua kali klik, total Rp 360.000.

### 5. Galat tipe TypeScript pada `crypto.getRandomValues`
- **Gejala:** `tsc --noEmit` gagal: `Uint32Array<ArrayBufferLike>` tidak cocok dengan `ArrayBufferView<ArrayBuffer>`.
- **Penyebab:** TypeScript terbaru membedakan `ArrayBuffer` dan `SharedArrayBuffer`.
- **Perbaikan:** tipe fungsi acak menjadi `Uint32Array<ArrayBuffer>` (kode & test).
- **Bukti:** `npm run typecheck` bersih.

### 6. Test sorting nama gagal
- **Gejala:** `expected 'kerbau' to be 'sapi'`.
- **Penyebab:** kesalahan di **test**, bukan di kode. Urutan A–Z yang benar: "Daging **K**erbau" sebelum "Daging **S**api".
- **Perbaikan:** harapan test dikoreksi dan diberi komentar.
- **Bukti:** 73/73 test lulus.

### 7. Nomor pembeli di pesan WhatsApp sulit dibaca
- **Gejala:** pesan WhatsApp menampilkan `No. WA: 6281200001111`.
- **Penyebab:** nomor dikirim dalam format database (62…), bukan format tampilan.
- **Perbaikan:** `pesanLengkap()` memakai `formatWA()`, sehingga tampil `0812-0000-1111`. Test ditambah.
- **Bukti:** `whatsapp.test.ts`.
