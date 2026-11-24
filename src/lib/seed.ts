import type { Pengaturan, Produk } from "./types";

/** 8 produk awal (syarat EKRAF #1). Harga & kuota = contoh. Foto: Wikimedia Commons (lihat kredit di footer). */
export const PRODUK_AWAL: Produk[] = [
  { id: "sapi", urutan: 1, nama: "Daging Sapi Meugang", kategori: "daging", satuan: "kg", harga: 180000, kuota: 100, terpesan: 38, momen: ["meugang"], aktif: true,
    foto: "/img/sapi.jpg", fokus: "50% 38%", ciri: ["Segar", "Lokal", "Dipotong subuh"],
    deskripsi: "Daging sapi lokal dipotong subuh sehari sebelum Meugang. Bisa minta dipotong kecil untuk sie masak." },
  { id: "kerbau", urutan: 2, nama: "Daging Kerbau Meugang", kategori: "daging", satuan: "kg", harga: 190000, kuota: 60, terpesan: 41, momen: ["meugang"], aktif: true,
    foto: "/img/kerbau.jpg", fokus: "50% 55%", ciri: ["Segar", "Lokal", "Favorit Meugang"],
    deskripsi: "Daging kerbau segar, pilihan banyak keluarga untuk masak Meugang. Ditimbang di hari pengambilan." },
  { id: "reuboh", urutan: 3, nama: "Sie Reuboh", kategori: "daging", satuan: "kg", harga: 220000, kuota: 30, terpesan: 22, momen: ["meugang"], aktif: true,
    foto: "/img/reuboh.jpg", fokus: "40% 40%", ciri: ["Gurih", "Asam segar", "Tahan lama"],
    deskripsi: "Daging rebus khas Aceh Besar dengan cuka dan lemak. Tahan beberapa hari, tinggal dipanaskan." },
  { id: "beulangong", urutan: 4, nama: "Paket Kuah Beulangong (50 porsi)", kategori: "masakan", satuan: "paket", harga: 2500000, kuota: 8, terpesan: 5, momen: ["kenduri"], aktif: true,
    foto: "/img/beulangong.jpg", fokus: "50% 40%", ciri: ["Berempah", "Nangka muda", "50 porsi"],
    deskripsi: "Gulai daging dan nangka muda yang dimasak dalam kuali besar. Cukup untuk sekitar 50 tamu kenduri." },
  { id: "kari", urutan: 5, nama: "Paket Kari Kambing Aceh (50 porsi)", kategori: "masakan", satuan: "paket", harga: 2800000, kuota: 6, terpesan: 6, momen: ["kenduri"], aktif: true,
    foto: "/img/kari.jpg", fokus: "50% 60%", ciri: ["Berempah", "Gongseng", "50 porsi"],
    deskripsi: "Kari kambing berempah dengan kelapa gongseng. Dimasak pagi hari dan diantar hangat ke lokasi." },
  { id: "timphan", urutan: 6, nama: "Timphan (isi 50)", kategori: "kue", satuan: "kotak", harga: 150000, kuota: 40, terpesan: 12, momen: ["meugang", "kenduri"], aktif: true,
    foto: "/img/timphan.jpg", fokus: "50% 50%", ciri: ["Lembut", "Manis", "Daun pisang"],
    deskripsi: "Kue berbungkus daun pisang, isi srikaya atau kelapa. Suguhan wajib saat Lebaran dan kenduri." },
  { id: "bhoi", urutan: 7, nama: "Kue Bhoi (isi 50)", kategori: "kue", satuan: "kotak", harga: 125000, kuota: 40, terpesan: 9, momen: ["meugang", "kenduri"], aktif: true,
    foto: "/img/bhoi.jpg", fokus: "50% 45%", ciri: ["Renyah", "Manis", "Hantaran"],
    deskripsi: "Bolu kering berbentuk ikan dan bunga, biasa dibawa sebagai hantaran. Renyah di luar, lembut di dalam." },
  { id: "keukarah", urutan: 8, nama: "Keukarah (1 kotak)", kategori: "kue", satuan: "kotak", harga: 60000, kuota: 50, terpesan: 46, momen: ["meugang", "kenduri"], aktif: true,
    foto: "/img/keukarah.jpg", fokus: "50% 50%", ciri: ["Renyah", "Manis", "Suguhan tamu"],
    deskripsi: "Kue jaring dari tepung beras yang renyah dan manis. Dikemas rapi dalam kotak untuk suguhan tamu." }
];

export const PENGATURAN_AWAL: Pengaturan = {
  namaUsaha: "Dalong Aceh",
  noWhatsApp: "6282261451487",
  momenLabel: "Meugang Ramadan 2027",
  poTutup: "2027-02-05T18:00:00+07:00",
  slots: [
    "Sabtu, 6 Feb 2027, 05.30–07.30",
    "Sabtu, 6 Feb 2027, 07.30–09.30",
    "Minggu, 7 Feb 2027, 05.30–07.30"
  ]
};
