/**
 * Aturan gerak (motion) Dalong Aceh: "tenang dan anggun".
 * Fungsi murni supaya mudah diuji; dipakai komponen untuk jeda bertahap dan paralaks halus.
 */

/** Jeda bertahap (ms) untuk elemen ke-i. Dibatasi supaya elemen ke-20 tidak menunggu terlalu lama. */
export function jedaBertahap(i: number, langkah = 90, maks = 8): number {
  if (!Number.isFinite(i) || i < 0) return 0;
  return Math.min(Math.floor(i), maks) * langkah;
}

/**
 * Geseran paralaks dari posisi kursor: kursor di tengah = 0, di tepi = ±kekuatan (px).
 * Hasil selalu dalam rentang [-kekuatan, kekuatan] walau kursor di luar kotak.
 */
export function geserParalaks(x: number, y: number, lebar: number, tinggi: number, kekuatan = 10): { dx: number; dy: number } {
  if (!(lebar > 0) || !(tinggi > 0)) return { dx: 0, dy: 0 };
  const batas = (v: number) => Math.max(-1, Math.min(1, v));
  const dx = batas((x / lebar - 0.5) * 2) * kekuatan;
  const dy = batas((y / tinggi - 0.5) * 2) * kekuatan;
  return { dx: Math.round(dx * 10) / 10, dy: Math.round(dy * 10) / 10 };
}

/** Jarak dari titik (persen) ke pusat kotak (50%, 50%): dipakai agar hidangan "keluar" dari tengah elips. */
export function jarakDariPusat(pos: { x: number; y: number }): { dx: number; dy: number } {
  return { dx: 50 - pos.x, dy: 50 - pos.y };
}

/** Animasi hanya dinyalakan jika pengguna tidak meminta gerak dikurangi dan browser mendukung IntersectionObserver. */
export function bolehBergerak(mintaKurangi: boolean, adaObserver: boolean): boolean {
  return !mintaKurangi && adaObserver;
}
