import type { Pengaturan, Pesanan, PesananBaru, Produk, ProdukInput, RingkasanPesanan, StatusPesanan } from "../lib/types";

export type ModeData = "live" | "demo";

/** Antarmuka yang sama untuk Supabase (live) dan localStorage (demo). */
export interface SumberData {
  mode: ModeData;
  // publik
  daftarProduk(): Promise<Produk[]>;
  pengaturan(): Promise<Pengaturan>;
  buatPesanan(input: PesananBaru): Promise<{ kode: string; pesanan: Pesanan }>;
  cekPesanan(kode: string, hp4: string): Promise<RingkasanPesanan | null>;
  // admin
  semuaProduk(): Promise<Produk[]>;
  simpanProduk(p: ProdukInput): Promise<void>;
  hapusProduk(id: string): Promise<void>;
  unggahFoto(foto: Blob): Promise<string>;
  daftarPesanan(): Promise<Pesanan[]>;
  ubahStatus(kode: string, status: StatusPesanan): Promise<void>;
  simpanPengaturan(s: Pengaturan): Promise<void>;
}

/** Galat yang aman ditampilkan ke pengguna. */
export class GalatPengguna extends Error {}
