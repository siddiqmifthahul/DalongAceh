export const TAMU_MIN = 10;
export const TAMU_MAKS = 500;

/** Aturan porsi (contoh, PRD 11.5) — bisa diubah pemilik usaha. */
export const ATURAN_PORSI = {
  tamuPerPaketMasakan: 50,
  kuePerTamu: 2,
  isiKuePerKotak: 50,
  orangPerKgDaging: 8
};

export interface PilihanKalkulator {
  masakan: string | null; // id produk masakan, null = tidak dipesan
  kue: string | null;
  daging: string | null;
}

export interface Rekomendasi { produkId: string; jumlah: number }

export function batasiTamu(n: number): number {
  if (!Number.isFinite(n)) return TAMU_MIN;
  return Math.min(TAMU_MAKS, Math.max(TAMU_MIN, Math.round(n)));
}

export function hitungPorsi(tamu: number, pilih: PilihanKalkulator, aturan = ATURAN_PORSI): Rekomendasi[] {
  const n = batasiTamu(tamu);
  const hasil: Rekomendasi[] = [];
  if (pilih.masakan) hasil.push({ produkId: pilih.masakan, jumlah: Math.ceil(n / aturan.tamuPerPaketMasakan) });
  if (pilih.kue) hasil.push({ produkId: pilih.kue, jumlah: Math.ceil(n * aturan.kuePerTamu / aturan.isiKuePerKotak) });
  if (pilih.daging) hasil.push({ produkId: pilih.daging, jumlah: Math.ceil(n / aturan.orangPerKgDaging) });
  return hasil;
}
