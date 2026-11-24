import { sisa } from "./katalog";
import type { ItemKeranjang, Produk } from "./types";

export const MAKS_ITEM_KERANJANG = 20;

/** Tambah ke keranjang tanpa melebihi sisa kuota. Mengembalikan keranjang baru + jumlah yang benar-benar ditambahkan. */
export function tambahKeKeranjang(cart: ItemKeranjang[], p: Produk, jumlah = 1): { cart: ItemKeranjang[]; ditambah: number } {
  if (!p.aktif || jumlah <= 0) return { cart, ditambah: 0 };
  const ada = cart.find(c => c.produkId === p.id);
  const sekarang = ada ? ada.jumlah : 0;
  const target = Math.min(sekarang + Math.floor(jumlah), sisa(p));
  const ditambah = Math.max(0, target - sekarang);
  if (ditambah === 0) return { cart, ditambah: 0 };
  if (!ada && cart.length >= MAKS_ITEM_KERANJANG) return { cart, ditambah: 0 };
  const baru = ada
    ? cart.map(c => (c.produkId === p.id ? { ...c, jumlah: target } : c))
    : [...cart, { produkId: p.id, jumlah: target }];
  return { cart: baru, ditambah };
}

/** Ubah jumlah; 0 atau kurang = hapus. Dibatasi sisa kuota. */
export function aturJumlah(cart: ItemKeranjang[], p: Produk, jumlah: number): ItemKeranjang[] {
  if (jumlah <= 0) return cart.filter(c => c.produkId !== p.id);
  const batas = Math.min(Math.floor(jumlah), sisa(p));
  if (batas <= 0) return cart.filter(c => c.produkId !== p.id);
  return cart.map(c => (c.produkId === p.id ? { ...c, jumlah: batas } : c));
}

/** Buang item yang produknya hilang/nonaktif dan rapikan jumlah ke sisa kuota terbaru. */
export function sesuaikanKeranjang(cart: ItemKeranjang[], produk: Produk[]): ItemKeranjang[] {
  const peta = new Map(produk.map(p => [p.id, p]));
  return cart
    .map(c => {
      const p = peta.get(c.produkId);
      if (!p || !p.aktif) return null;
      const j = Math.min(c.jumlah, sisa(p));
      return j > 0 ? { produkId: c.produkId, jumlah: j } : null;
    })
    .filter((c): c is ItemKeranjang => c !== null);
}

export function totalKeranjang(cart: ItemKeranjang[], produk: Produk[]): number {
  const peta = new Map(produk.map(p => [p.id, p]));
  return cart.reduce((t, c) => t + (peta.get(c.produkId)?.harga ?? 0) * c.jumlah, 0);
}

export function jumlahItem(cart: ItemKeranjang[]): number {
  return cart.reduce((t, c) => t + c.jumlah, 0);
}
