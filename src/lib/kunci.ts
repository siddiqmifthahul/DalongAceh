/**
 * Pengaman kunci Supabase di frontend (materi: "jangan tulis kunci rahasia di kode").
 * Hanya kunci publik (publishable / anon) yang boleh dipakai di browser.
 */
export function kunciAman(k: string): boolean {
  if (!k) return false;
  if (k.startsWith("sb_secret_")) return false;
  const bagian = k.split(".");
  if (bagian.length === 3) {
    try {
      const isi = JSON.parse(atob(bagian[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (isi && isi.role === "service_role") return false;
    } catch {
      /* bukan JWT yang bisa dibaca: biarkan Supabase yang menolak */
    }
  }
  return true;
}

/** URL project Supabase yang sah: https://<ref>.supabase.co */
export function urlSupabaseValid(url: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url);
}
