/**
 * Sumber data MODE DEMO: semuanya di localStorage browser ini (syarat EKRAF #6),
 * divalidasi setiap kali dibaca. Aturan bisnis sama dengan server: kuota, jendela PO, slot.
 */
import { arrayOf, isPengaturan, isPesanan, isProduk } from "../lib/skema";
import { bacaAman, KUNCI, tulisAman } from "../lib/storage";
import { buatKode, kodeValid } from "../lib/kode";
import { blobKeDataUrl } from "../lib/foto";
import { sisa } from "../lib/katalog";
import { PENGATURAN_AWAL, PRODUK_AWAL } from "../lib/seed";
import type { Pengaturan, Pesanan, Produk } from "../lib/types";
import { GalatPengguna, type SumberData } from "./types";

export const MAKS_PRODUK = 30;
export const MAKS_PESANAN = 500;
const isDaftarProduk = arrayOf(isProduk, MAKS_PRODUK);
const isDaftarPesanan = arrayOf(isPesanan, MAKS_PESANAN);

const PESANAN_CONTOH: Pesanan[] = [
  { kode: "MK-7Q4XK2PD", waktu: "2026-11-20T09:12:00+07:00", sumber: "web", nama: "Nur", noHp: "6281234567890", metode: "ambil", alamat: null,
    slot: PENGATURAN_AWAL.slots[0], catatan: null, status: "dp", total: 840000,
    items: [{ produkId: "sapi", nama: "Daging Sapi Meugang", jumlah: 3, hargaSatuan: 180000, satuan: "kg" },
            { produkId: "timphan", nama: "Timphan (isi 50)", jumlah: 2, hargaSatuan: 150000, satuan: "kotak" }] },
  { kode: "MK-K9TR3MWA", waktu: "2026-11-21T14:40:00+07:00", sumber: "web", nama: "Rizal", noHp: "6285277001122", metode: "antar",
    alamat: "Meunasah Lampineung, Banda Aceh", slot: PENGATURAN_AWAL.slots[1], catatan: "Untuk kenduri meunasah", status: "lunas", total: 5000000,
    items: [{ produkId: "beulangong", nama: "Paket Kuah Beulangong (50 porsi)", jumlah: 2, hargaSatuan: 2500000, satuan: "paket" }] },
  { kode: "MK-P4HN8ZXC", waktu: "2026-11-23T08:05:00+07:00", sumber: "web", nama: "Cut Mala", noHp: "6282160009988", metode: "ambil", alamat: null,
    slot: PENGATURAN_AWAL.slots[2], catatan: null, status: "baru", total: 60000,
    items: [{ produkId: "keukarah", nama: "Keukarah (1 kotak)", jumlah: 1, hargaSatuan: 60000, satuan: "kotak" }] }
];

const tunda = () => new Promise(r => setTimeout(r, 120)); // terasa seperti jaringan

function produk(): Produk[] { return bacaAman(KUNCI.demoProduk, isDaftarProduk, PRODUK_AWAL); }
function pesanan(): Pesanan[] { return bacaAman(KUNCI.demoPesanan, isDaftarPesanan, PESANAN_CONTOH); }
function pengaturan(): Pengaturan { return bacaAman(KUNCI.demoPengaturan, isPengaturan, PENGATURAN_AWAL); }

function simpan<T>(kunci: string, nilai: T, cek: (x: unknown) => x is T) {
  const r = tulisAman(kunci, nilai, cek);
  if (!r.ok) {
    throw new GalatPengguna(r.alasan === "penuh"
      ? "Penyimpanan browser penuh. Hapus beberapa produk/foto atau reset data demo."
      : r.alasan === "tidak-valid" ? "Data tidak valid, perubahan dibatalkan." : "Browser ini tidak mengizinkan penyimpanan data.");
  }
}

export function resetDemo(): void {
  simpan(KUNCI.demoProduk, PRODUK_AWAL, isDaftarProduk);
  simpan(KUNCI.demoPesanan, PESANAN_CONTOH, isDaftarPesanan);
  simpan(KUNCI.demoPengaturan, PENGATURAN_AWAL, isPengaturan);
}

export function sumberDemo(): SumberData {
  return {
    mode: "demo",

    async daftarProduk() { await tunda(); return produk().filter(p => p.aktif).sort((a, b) => a.urutan - b.urutan); },
    async semuaProduk() { await tunda(); return [...produk()].sort((a, b) => a.urutan - b.urutan); },
    async pengaturan() { return pengaturan(); },

    async buatPesanan(input) {
      await tunda();
      const s = pengaturan();
      if (Date.now() > Date.parse(s.poTutup)) throw new GalatPengguna("PO sudah ditutup");
      if (!s.slots.includes(input.slot)) throw new GalatPengguna("Jam ambil tidak valid");
      if (!input.items.length || input.items.length > 20) throw new GalatPengguna("Isi pesanan tidak valid");
      const daftar = produk();
      const semuaPesanan = pesanan();
      if (semuaPesanan.length >= MAKS_PESANAN) throw new GalatPengguna("Batas pesanan mode demo tercapai. Reset data demo.");
      const items = input.items.map(i => {
        const p = daftar.find(x => x.id === i.produkId && x.aktif);
        if (!p) throw new GalatPengguna("Ada produk yang sudah tidak tersedia");
        if (!Number.isInteger(i.jumlah) || i.jumlah < 1 || i.jumlah > sisa(p)) throw new GalatPengguna("Kuota " + p.nama + " tidak cukup (sisa " + sisa(p) + ")");
        return { produkId: p.id, nama: p.nama, jumlah: i.jumlah, hargaSatuan: p.harga, satuan: p.satuan };
      });
      const kode = buatKode(k => semuaPesanan.some(o => o.kode === k));
      const baru: Pesanan = {
        kode, waktu: new Date().toISOString(), sumber: "web", nama: input.nama, noHp: input.noHp, metode: input.metode,
        alamat: input.metode === "antar" ? input.alamat : null, slot: input.slot, catatan: input.catatan || null, status: "baru",
        items, total: items.reduce((t, i) => t + i.jumlah * i.hargaSatuan, 0)
      };
      const produkBaru = daftar.map(p => {
        const it = items.find(i => i.produkId === p.id);
        return it ? { ...p, terpesan: p.terpesan + it.jumlah } : p;
      });
      simpan(KUNCI.demoProduk, produkBaru, isDaftarProduk);
      simpan(KUNCI.demoPesanan, [baru, ...semuaPesanan], isDaftarPesanan);
      return { kode, pesanan: baru };
    },

    async cekPesanan(kode, hp4) {
      await tunda();
      if (!kodeValid(kode) || !/^\d{4}$/.test(hp4)) return null;
      const o = pesanan().find(x => x.kode === kode && x.noHp.endsWith(hp4));
      return o ? { kode: o.kode, status: o.status, metode: o.metode, slot: o.slot, total: o.total,
        items: o.items.map(i => ({ nama: i.nama, jumlah: i.jumlah, satuan: i.satuan })) } : null;
    },

    async simpanProduk(p) {
      await tunda();
      const daftar = produk();
      if (p.id) {
        const lama = daftar.find(x => x.id === p.id);
        if (!lama) throw new GalatPengguna("Produk tidak ditemukan.");
        simpan(KUNCI.demoProduk, daftar.map(x => (x.id === p.id ? { ...lama, ...p, id: lama.id, terpesan: lama.terpesan } : x)), isDaftarProduk);
      } else {
        if (daftar.length >= MAKS_PRODUK) throw new GalatPengguna("Maksimal " + MAKS_PRODUK + " produk.");
        const id = "p-" + crypto.randomUUID().slice(0, 8);
        simpan(KUNCI.demoProduk, [...daftar, { ...p, id, terpesan: 0 }], isDaftarProduk);
      }
    },

    async hapusProduk(id) {
      await tunda();
      simpan(KUNCI.demoProduk, produk().filter(p => p.id !== id), isDaftarProduk);
    },

    async unggahFoto(foto) {
      // Mode demo: foto disimpan sebagai data URL WebP di localStorage (dibatasi ukurannya oleh validasi)
      const url = await blobKeDataUrl(foto);
      if (url.length > 400_000) throw new GalatPengguna("Foto terlalu besar untuk mode demo.");
      return url;
    },

    async daftarPesanan() { await tunda(); return pesanan(); },

    async ubahStatus(kode, status) {
      await tunda();
      const semua = pesanan();
      const o = semua.find(x => x.kode === kode);
      if (!o || o.status === status) return;
      let daftar = produk();
      if (status === "batal") {
        daftar = daftar.map(p => {
          const it = o.items.find(i => i.produkId === p.id);
          return it ? { ...p, terpesan: Math.max(0, p.terpesan - it.jumlah) } : p;
        });
      } else if (o.status === "batal") {
        for (const it of o.items) {
          const p = daftar.find(x => x.id === it.produkId);
          if (p && it.jumlah > sisa(p)) throw new GalatPengguna("Kuota " + it.nama + " tidak cukup untuk mengaktifkan lagi pesanan ini");
        }
        daftar = daftar.map(p => {
          const it = o.items.find(i => i.produkId === p.id);
          return it ? { ...p, terpesan: p.terpesan + it.jumlah } : p;
        });
      }
      simpan(KUNCI.demoProduk, daftar, isDaftarProduk);
      simpan(KUNCI.demoPesanan, semua.map(x => (x.kode === kode ? { ...x, status } : x)), isDaftarPesanan);
    },

    async simpanPengaturan(s) {
      await tunda();
      simpan(KUNCI.demoPengaturan, s, isPengaturan);
    }
  };
}
