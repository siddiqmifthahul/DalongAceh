/**
 * Validator untuk data yang dibaca dari localStorage / server.
 * Semua data dari luar dianggap TIDAK TEPERCAYA (bisa diubah lewat DevTools).
 */
import { isKategori, isMomen, isSatuan } from "./validasi";
import { kodeValid } from "./kode";
import type { ItemKeranjang, Pengaturan, Pesanan, Produk, StatusPesanan } from "./types";
import { STATUS } from "./types";

const str = (x: unknown, min: number, max: number): x is string => typeof x === "string" && x.length >= min && x.length <= max;
const int = (x: unknown, min: number, max: number): x is number => typeof x === "number" && Number.isInteger(x) && x >= min && x <= max;
const tanpaTag = (s: string) => !/[<>]/.test(s);
const fotoAman = (x: unknown) => x === null || (typeof x === "string" && /^(\/img\/[a-z0-9-]+\.(jpg|webp|png)|https:\/\/[^\s<>"']{1,500}|data:image\/webp;base64,[A-Za-z0-9+/=]+)$/.test(x) && x.length < 400_000);

export function isProduk(x: unknown): x is Produk {
  if (typeof x !== "object" || x === null) return false;
  const p = x as Record<string, unknown>;
  return str(p.id, 1, 64) &&
    str(p.nama, 3, 60) && tanpaTag(p.nama as string) &&
    isKategori(p.kategori) && isSatuan(p.satuan) &&
    int(p.harga, 1000, 50_000_000) &&
    str(p.deskripsi, 1, 150) && tanpaTag(p.deskripsi as string) &&
    Array.isArray(p.ciri) && p.ciri.length <= 3 && p.ciri.every(c => str(c, 1, 16) && tanpaTag(c as string)) &&
    fotoAman(p.foto) &&
    typeof p.fokus === "string" && /^\d{1,3}% \d{1,3}%$/.test(p.fokus) &&
    Array.isArray(p.momen) && p.momen.length >= 1 && p.momen.length <= 2 && p.momen.every(isMomen) &&
    int(p.kuota, 0, 10_000) && int(p.terpesan, 0, p.kuota as number) &&
    typeof p.aktif === "boolean" && int(p.urutan, -1_000_000, 1_000_000);
}

export function isStatus(x: unknown): x is StatusPesanan {
  return typeof x === "string" && x in STATUS;
}

export function isPesanan(x: unknown): x is Pesanan {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.kode === "string" && kodeValid(o.kode) &&
    typeof o.waktu === "string" && !Number.isNaN(Date.parse(o.waktu)) &&
    (o.sumber === "web" || o.sumber === "manual") &&
    str(o.nama, 2, 50) && tanpaTag(o.nama as string) &&
    typeof o.noHp === "string" && /^628\d{7,12}$/.test(o.noHp) &&
    (o.metode === "ambil" || o.metode === "antar") &&
    (o.alamat === null || (str(o.alamat, 0, 200) && tanpaTag(o.alamat as string))) &&
    str(o.slot, 1, 80) &&
    (o.catatan === null || (str(o.catatan, 0, 200) && tanpaTag(o.catatan as string))) &&
    isStatus(o.status) &&
    Array.isArray(o.items) && o.items.length >= 1 && o.items.length <= 20 &&
    o.items.every(i => {
      const it = i as Record<string, unknown>;
      return typeof it === "object" && it !== null &&
        (it.produkId === null || str(it.produkId, 1, 64)) &&
        str(it.nama, 1, 60) && int(it.jumlah, 1, 1000) && int(it.hargaSatuan, 0, 50_000_000) && isSatuan(it.satuan);
    }) &&
    int(o.total, 0, 1_000_000_000);
}

export function isItemKeranjang(x: unknown): x is ItemKeranjang {
  if (typeof x !== "object" || x === null) return false;
  const c = x as Record<string, unknown>;
  return str(c.produkId, 1, 64) && int(c.jumlah, 1, 1000);
}

export function isPengaturan(x: unknown): x is Pengaturan {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Record<string, unknown>;
  return str(s.namaUsaha, 2, 60) && tanpaTag(s.namaUsaha as string) &&
    typeof s.noWhatsApp === "string" && /^628\d{7,12}$/.test(s.noWhatsApp) &&
    str(s.momenLabel, 2, 60) && tanpaTag(s.momenLabel as string) &&
    typeof s.poTutup === "string" && !Number.isNaN(Date.parse(s.poTutup)) &&
    Array.isArray(s.slots) && s.slots.length >= 1 && s.slots.length <= 12 &&
    s.slots.every(v => str(v, 3, 80) && tanpaTag(v as string));
}

/** Validator untuk array: SEMUA elemen harus valid, kalau tidak dianggap rusak. */
export function arrayOf<T>(cek: (x: unknown) => x is T, maks: number) {
  return (x: unknown): x is T[] => Array.isArray(x) && x.length <= maks && x.every(cek);
}
