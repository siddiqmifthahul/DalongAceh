/**
 * Login demo admin/admin (DIWAJIBKAN tugas EKRAF).
 * Ini BUKAN pengaman sungguhan: semua data mode demo hanya ada di browser pengunjung.
 * Mitigasi (OWASP A07): maks. 5 percobaan lalu terkunci 5 menit, sesi 30 menit di sessionStorage.
 */
import { bacaAman, hapusAman, tulisAman } from "./storage";

export const DEMO_USER = "admin";
export const DEMO_PASS = "admin";
export const MAKS_PERCOBAAN = 5;
export const KUNCI_MS = 5 * 60 * 1000;
export const SESI_MS = 30 * 60 * 1000;

const KUNCI_SESI = "mk:v1:demo:sesi";
const KUNCI_GAGAL = "mk:v1:demo:gagal";

interface Sesi { exp: number }
interface Gagal { jumlah: number; kunciSampai: number }
const isSesi = (x: unknown): x is Sesi => typeof x === "object" && x !== null && typeof (x as Sesi).exp === "number";
const isGagal = (x: unknown): x is Gagal => typeof x === "object" && x !== null &&
  Number.isInteger((x as Gagal).jumlah) && (x as Gagal).jumlah >= 0 && typeof (x as Gagal).kunciSampai === "number";

export type HasilLogin =
  | { ok: true }
  | { ok: false; alasan: "salah"; sisaPercobaan: number }
  | { ok: false; alasan: "terkunci"; menit: number };

/** Logika murni (mudah diuji). */
export function cobaLogin(user: string, pass: string, gagal: Gagal, sekarang: number): { hasil: HasilLogin; gagal: Gagal } {
  if (gagal.kunciSampai > sekarang) {
    return { hasil: { ok: false, alasan: "terkunci", menit: Math.ceil((gagal.kunciSampai - sekarang) / 60000) }, gagal };
  }
  if (user.trim() === DEMO_USER && pass === DEMO_PASS) {
    return { hasil: { ok: true }, gagal: { jumlah: 0, kunciSampai: 0 } };
  }
  const jumlah = gagal.jumlah + 1;
  if (jumlah >= MAKS_PERCOBAAN) {
    return { hasil: { ok: false, alasan: "terkunci", menit: KUNCI_MS / 60000 }, gagal: { jumlah: 0, kunciSampai: sekarang + KUNCI_MS } };
  }
  return { hasil: { ok: false, alasan: "salah", sisaPercobaan: MAKS_PERCOBAAN - jumlah }, gagal: { jumlah, kunciSampai: 0 } };
}

export function loginDemo(user: string, pass: string, sekarang = Date.now()): HasilLogin {
  const gagal = bacaAman(KUNCI_GAGAL, isGagal, { jumlah: 0, kunciSampai: 0 }, "session");
  const r = cobaLogin(user, pass, gagal, sekarang);
  tulisAman(KUNCI_GAGAL, r.gagal, isGagal, "session");
  if (r.hasil.ok) tulisAman(KUNCI_SESI, { exp: sekarang + SESI_MS }, isSesi, "session");
  return r.hasil;
}

export function sesiDemoAktif(sekarang = Date.now()): boolean {
  const s = bacaAman<Sesi | null>(KUNCI_SESI, (x): x is Sesi | null => x === null || isSesi(x), null, "session");
  if (!s) return false;
  if (s.exp <= sekarang) { hapusAman(KUNCI_SESI, "session"); return false; }
  return true;
}

export function keluarDemo(): void {
  hapusAman(KUNCI_SESI, "session");
}
