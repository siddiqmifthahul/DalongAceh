const angka = new Intl.NumberFormat("id-ID");

/** 180000 -> "Rp 180.000" (spasi biasa, tanpa desimal). */
export function rp(n: number): string {
  return "Rp " + angka.format(Math.round(n));
}

/** "Rp 180.000/kg" */
export function hargaSatuan(harga: number, satuan: string): string {
  return rp(harga) + "/" + satuan;
}

/** Rapikan spasi berlebih dan potong sesuai batas. */
export function rapikan(teks: string, maks = 500): string {
  return teks.replace(/\s+/g, " ").trim().slice(0, maks);
}

/** Huruf kapital di awal kalimat. */
export function kapitalAwal(teks: string): string {
  return teks.charAt(0).toUpperCase() + teks.slice(1);
}

const tanggalFmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta"
});
/** "Jumat, 5 Februari 2027 pukul 18.00" */
export function tanggalPanjang(iso: string): string {
  return tanggalFmt.format(new Date(iso));
}

export interface SisaWaktu { hari: number; jam: number; menit: number; selesai: boolean }
export function sisaWaktu(targetIso: string, sekarang: number = Date.now()): SisaWaktu {
  const diff = new Date(targetIso).getTime() - sekarang;
  if (!(diff > 0)) return { hari: 0, jam: 0, menit: 0, selesai: true };
  return {
    hari: Math.floor(diff / 864e5),
    jam: Math.floor(diff / 36e5) % 24,
    menit: Math.floor(diff / 6e4) % 60,
    selesai: false
  };
}
