import { rp } from "./format";
import type { Produk, Pesanan } from "./types";

/**
 * Ubah nomor HP Indonesia ke format wa.me (62xxxxxxxxxx).
 * Menerima "0812-3456-7890", "+62 812 3456 7890", "6281234567890".
 * Mengembalikan null jika bukan nomor HP Indonesia yang valid.
 */
export function normalWA(input: string): string | null {
  let d = String(input).replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return /^628\d{7,12}$/.test(d) ? d : null;
}

/** 6282261451487 -> "0822-6145-1487" */
export function formatWA(d: string): string {
  return "0" + d.slice(2).replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
}

/** Link wa.me yang aman: nomor hanya angka, teks di-encode. */
export function waUrl(nomor: string, teks: string): string | null {
  const n = normalWA(nomor);
  if (!n) return null;
  return "https://wa.me/" + n + "?text=" + encodeURIComponent(teks);
}

/** Pesan cepat dari tombol di kartu produk (pilar 2: satu ketukan). */
export function pesanCepat(p: Pick<Produk, "nama" | "harga" | "satuan">, habis: boolean): string {
  return habis
    ? "Assalamu'alaikum, apakah " + p.nama + " masih bisa dipesan? Di web tertulis kuotanya sudah habis."
    : "Assalamu'alaikum, saya mau pesan " + p.nama + " (" + rp(p.harga) + "/" + p.satuan + ").\nApakah masih tersedia?";
}

/** Pesan lengkap dari keranjang (PRD 11.4b). */
export function pesanLengkap(o: Pick<Pesanan, "kode" | "nama" | "noHp" | "metode" | "alamat" | "slot" | "catatan" | "items" | "total">, momenLabel: string): string {
  const baris = [
    "Assalamu'alaikum, saya mau pesan (" + momenLabel + ")",
    "Kode: " + o.kode,
    ...o.items.map(i => "- " + i.nama + " x " + i.jumlah + " " + i.satuan + " = " + rp(i.jumlah * i.hargaSatuan)),
    "Total: " + rp(o.total),
    "Nama: " + o.nama,
    "No. WA: " + (normalWA(o.noHp) ? formatWA(normalWA(o.noHp)!) : o.noHp),
    (o.metode === "antar" ? "Antar: " : "Ambil: ") + o.slot,
    o.metode === "antar" && o.alamat ? "Alamat: " + o.alamat : null,
    "Catatan: " + (o.catatan || "-")
  ];
  return baris.filter((b): b is string => b !== null).join("\n");
}
