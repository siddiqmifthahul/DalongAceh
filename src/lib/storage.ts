/**
 * localStorage dengan validasi (syarat EKRAF #6).
 * - kunci berversi "mk:v1:*"
 * - JSON.parse selalu dalam try/catch
 * - data dibaca SELALU divalidasi; jika rusak -> kembali ke nilai awal, tanpa crash
 * - penyimpanan penuh / diblokir ditangani dengan aman
 */
export const KUNCI = {
  keranjang: "mk:v1:keranjang",
  demoProduk: "mk:v1:demo:produk",
  demoPesanan: "mk:v1:demo:pesanan",
  demoPengaturan: "mk:v1:demo:pengaturan",
  pesananSaya: "mk:v1:pesanan-saya"
} as const;

export type HasilTulis = { ok: true } | { ok: false; alasan: "penuh" | "tidak-tersedia" | "tidak-valid" };

function penyimpanan(jenis: "local" | "session"): Storage | null {
  try {
    return jenis === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null; // mis. mode privat / diblokir
  }
}

export function bacaAman<T>(kunci: string, cek: (x: unknown) => x is T, awal: T, jenis: "local" | "session" = "local"): T {
  const s = penyimpanan(jenis);
  if (!s) return awal;
  let raw: string | null;
  try { raw = s.getItem(kunci); } catch { return awal; }
  if (raw === null) return awal;
  try {
    const data: unknown = JSON.parse(raw);
    if (cek(data)) return data;
  } catch { /* JSON rusak */ }
  console.warn("[storage] Data '" + kunci + "' rusak atau tidak valid, dikembalikan ke data awal.");
  try { s.removeItem(kunci); } catch { /* abaikan */ }
  return awal;
}

export function tulisAman<T>(kunci: string, nilai: T, cek: (x: unknown) => x is T, jenis: "local" | "session" = "local"): HasilTulis {
  if (!cek(nilai)) return { ok: false, alasan: "tidak-valid" };
  const s = penyimpanan(jenis);
  if (!s) return { ok: false, alasan: "tidak-tersedia" };
  try {
    s.setItem(kunci, JSON.stringify(nilai));
    return { ok: true };
  } catch (e) {
    const penuh = e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
    return { ok: false, alasan: penuh ? "penuh" : "tidak-tersedia" };
  }
}

export function hapusAman(kunci: string, jenis: "local" | "session" = "local"): void {
  const s = penyimpanan(jenis);
  try { s?.removeItem(kunci); } catch { /* abaikan */ }
}
