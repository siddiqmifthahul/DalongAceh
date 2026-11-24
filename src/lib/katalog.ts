import type { Kategori, Momen, Produk } from "./types";

export const HARGA_MAKS_FILTER = 3_000_000;

export interface Filter {
  q: string;
  kategori: Kategori | "semua";
  momen: Momen | "semua";
  sembunyikanHabis: boolean;
  hargaMaks: number;
}
export type Urutan = "default" | "murah" | "mahal" | "nama" | "sisa";

export const FILTER_AWAL: Filter = { q: "", kategori: "semua", momen: "semua", sembunyikanHabis: false, hargaMaks: HARGA_MAKS_FILTER };

export const sisa = (p: Pick<Produk, "kuota" | "terpesan">): number => Math.max(0, p.kuota - p.terpesan);

export type StatusKuota = "ada" | "hampir" | "habis";
/** Hampir habis = sisa ≤ 20% kuota. */
export function statusKuota(p: Pick<Produk, "kuota" | "terpesan">): StatusKuota {
  const s = sisa(p);
  if (s <= 0) return "habis";
  return p.kuota > 0 && s / p.kuota <= 0.2 ? "hampir" : "ada";
}
export function persenSisa(p: Pick<Produk, "kuota" | "terpesan">): number {
  return p.kuota > 0 ? Math.round(sisa(p) / p.kuota * 100) : 0;
}

export function jumlahFilterAktif(f: Filter): number {
  return Number(f.momen !== "semua") + Number(f.sembunyikanHabis) + Number(f.hargaMaks < HARGA_MAKS_FILTER);
}

export function saringProduk(list: Produk[], f: Filter, urutan: Urutan = "default"): Produk[] {
  const q = f.q.trim().toLowerCase();
  const hasil = list
    .filter(p => p.aktif)
    .filter(p => !q || [p.nama, p.deskripsi, ...p.ciri].join(" ").toLowerCase().includes(q))
    .filter(p => f.kategori === "semua" || p.kategori === f.kategori)
    .filter(p => f.momen === "semua" || p.momen.includes(f.momen))
    .filter(p => !f.sembunyikanHabis || sisa(p) > 0)
    .filter(p => p.harga <= f.hargaMaks);
  const pembanding: Record<Exclude<Urutan, "default">, (a: Produk, b: Produk) => number> = {
    murah: (a, b) => a.harga - b.harga,
    mahal: (a, b) => b.harga - a.harga,
    nama: (a, b) => a.nama.localeCompare(b.nama, "id"),
    sisa: (a, b) => sisa(b) - sisa(a)
  };
  return urutan === "default" ? [...hasil].sort((a, b) => a.urutan - b.urutan) : [...hasil].sort(pembanding[urutan]);
}

export function hitungPerMomen(list: Produk[]): Record<Momen | "semua", number> {
  const aktif = list.filter(p => p.aktif);
  return {
    semua: aktif.length,
    meugang: aktif.filter(p => p.momen.includes("meugang")).length,
    kenduri: aktif.filter(p => p.momen.includes("kenduri")).length
  };
}
