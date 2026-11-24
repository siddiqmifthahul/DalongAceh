/** Huruf & angka tanpa yang mudah tertukar (O/0, I/1). 32 karakter: modulo tidak bias. */
export const ALFABET_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const POLA = /^MK-[A-HJ-NP-Z2-9]{8}$/;

type Acak = (arr: Uint32Array<ArrayBuffer>) => Uint32Array<ArrayBuffer>;
const acakKripto: Acak = arr => crypto.getRandomValues(arr);

/** Kode pesanan acak "MK-XXXXXXXX" memakai crypto.getRandomValues (bukan Math.random). */
export function buatKode(sudahAda: (k: string) => boolean = () => false, acak: Acak = acakKripto): string {
  for (let percobaan = 0; percobaan < 20; percobaan++) {
    const b = acak(new Uint32Array(8));
    const k = "MK-" + Array.from(b, x => ALFABET_KODE[x % ALFABET_KODE.length]).join("");
    if (!sudahAda(k)) return k;
  }
  throw new Error("Gagal membuat kode pesanan unik");
}

export function kodeValid(k: string): boolean {
  return POLA.test(k);
}

/** Rapikan input pembeli: huruf besar, spasi dibuang, "MK7Q4..." -> "MK-7Q4...". */
export function rapikanKode(input: string): string {
  const s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.startsWith("MK") ? "MK-" + s.slice(2) : s;
}
