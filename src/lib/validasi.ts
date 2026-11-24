import { normalWA } from "./whatsapp";
import { rapikan } from "./format";
import type { Kategori, Metode, Momen, PesananBaru, ProdukInput, Satuan } from "./types";
import { KATEGORI, SATUAN } from "./types";

export type Galat<K extends string> = Partial<Record<K, string>>;

const ADA_TAG = /[<>]/;
const NAMA_ORANG = /^[A-Za-zÀ-ÿ' .()-]{2,50}$/;

/* ---------------- pesanan pembeli ---------------- */

export interface FormPesanan {
  nama: string;
  noHp: string;
  metode: string;
  alamat: string;
  slot: string;
  catatan: string;
}
export type FieldPesanan = "nama" | "noHp" | "alamat" | "slot" | "catatan" | "metode";

export function validasiPesanan(f: FormPesanan, slots: string[]):
  { ok: true; data: Omit<PesananBaru, "items"> } | { ok: false; galat: Galat<FieldPesanan> } {
  const g: Galat<FieldPesanan> = {};
  const nama = rapikan(f.nama, 60);
  const hp = normalWA(f.noHp);
  const metode = f.metode as Metode;
  const alamat = rapikan(f.alamat, 250);
  const catatan = rapikan(f.catatan, 250);

  if (!NAMA_ORANG.test(nama)) g.nama = "Tulis nama dengan huruf, 2–50 karakter.";
  if (!hp) g.noHp = "Nomor harus diawali 08 atau 628 dan berisi 10–15 angka.";
  if (metode !== "ambil" && metode !== "antar") g.metode = "Pilih cara terima.";
  if (metode === "antar" && (alamat.length < 10 || alamat.length > 200)) g.alamat = "Tulis alamat lengkap, 10–200 karakter.";
  else if (metode === "antar" && ADA_TAG.test(alamat)) g.alamat = "Alamat tidak boleh berisi tanda < atau >.";
  if (!slots.includes(f.slot)) g.slot = metode === "antar" ? "Pilih jam antar." : "Pilih jam ambil.";
  if (catatan.length > 200) g.catatan = "Catatan maksimal 200 karakter.";
  else if (ADA_TAG.test(catatan)) g.catatan = "Catatan tidak boleh berisi tanda < atau >.";

  if (Object.keys(g).length) return { ok: false, galat: g };
  return { ok: true, data: { nama, noHp: hp!, metode, alamat: metode === "antar" ? alamat : "", slot: f.slot, catatan } };
}

/* ---------------- produk (form admin) ---------------- */

export type FieldProduk = "nama" | "kategori" | "satuan" | "harga" | "kuota" | "deskripsi" | "ciri" | "momen" | "foto" | "fokus";

export function bacaCiri(teks: string): string[] {
  return teks.split(",").map(s => rapikan(s, 40)).filter(Boolean);
}

export function validasiProduk(p: ProdukInput, terpesan = 0): Galat<FieldProduk> {
  const g: Galat<FieldProduk> = {};
  const nama = rapikan(p.nama, 80);
  if (nama.length < 3 || nama.length > 60) g.nama = "Nama produk 3–60 karakter.";
  else if (ADA_TAG.test(nama)) g.nama = "Nama tidak boleh berisi tanda < atau >.";
  if (!(p.kategori in KATEGORI)) g.kategori = "Pilih kategori dari daftar.";
  if (!SATUAN.includes(p.satuan)) g.satuan = "Pilih satuan dari daftar.";
  if (!Number.isInteger(p.harga) || p.harga < 1000 || p.harga > 50_000_000) g.harga = "Harga berupa angka bulat Rp 1.000 – Rp 50.000.000.";
  if (!Number.isInteger(p.kuota) || p.kuota < 1 || p.kuota > 10_000) g.kuota = "Kuota berupa angka 1–10.000.";
  else if (p.kuota < terpesan) g.kuota = "Kuota tidak boleh kurang dari yang sudah terpesan (" + terpesan + ").";
  const desk = rapikan(p.deskripsi, 300);
  if (desk.length < 10 || desk.length > 150) g.deskripsi = "Deskripsi 10–150 karakter, sekitar 3 baris.";
  else if (ADA_TAG.test(desk)) g.deskripsi = "Deskripsi tidak boleh berisi tanda < atau >.";
  if (p.ciri.length > 3) g.ciri = "Maksimal 3 ciri khas.";
  else if (p.ciri.some(c => c.length > 16 || ADA_TAG.test(c))) g.ciri = "Setiap ciri maksimal 16 karakter, tanpa tanda < atau >.";
  if (!p.momen.length || p.momen.some(m => m !== "meugang" && m !== "kenduri")) g.momen = "Pilih minimal satu momen.";
  if (!p.foto) g.foto = "Unggah foto produk supaya katalog tetap seragam.";
  else if (!/^(\/img\/[a-z0-9-]+\.(jpg|webp|png)|https:\/\/[^\s<>"']+|data:image\/webp;base64,[A-Za-z0-9+/=]+)$/i.test(p.foto)) g.foto = "Alamat foto tidak valid.";
  if (!/^\d{1,3}% \d{1,3}%$/.test(p.fokus)) g.fokus = "Titik fokus foto tidak valid.";
  return g;
}

export function isKategori(x: unknown): x is Kategori { return typeof x === "string" && x in KATEGORI; }
export function isSatuan(x: unknown): x is Satuan { return typeof x === "string" && (SATUAN as string[]).includes(x); }
export function isMomen(x: unknown): x is Momen { return x === "meugang" || x === "kenduri"; }
