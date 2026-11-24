/**
 * Pemindai rahasia sederhana (dipakai oleh scripts/cek-rahasia.ts dan unit test).
 * Mencari pola kunci/password yang TIDAK boleh ada di repo publik.
 */
export interface Temuan { jenis: string; baris: number; cuplikan: string }

const POLA: { jenis: string; re: RegExp }[] = [
  { jenis: "Kunci secret Supabase", re: /sb_secret_[A-Za-z0-9_-]{16,}/ },
  { jenis: "Private key", re: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { jenis: "URL database berisi password", re: /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s]{6,}@/i },
  { jenis: "Variabel rahasia berisi nilai", re: /\b(SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|DB_PASSWORD|DATABASE_PASSWORD|SECRET_KEY)\s*[=:]\s*["']?[^\s"'<>]{8,}/ }
];

function decodeBase64Url(s: string): string {
  return atob(s.replace(/-/g, "+").replace(/_/g, "/")); // atob tersedia di browser & Node 16+
}

/** JWT Supabase bertipe service_role (kunci lama yang memotong RLS). */
function adaJwtServiceRole(baris: string): boolean {
  for (const m of baris.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.(eyJ[A-Za-z0-9_-]{10,})\.[A-Za-z0-9_-]{10,}/g)) {
    try {
      if (JSON.parse(decodeBase64Url(m[1])).role === "service_role") return true;
    } catch { /* abaikan */ }
  }
  return false;
}

export function cariRahasia(teks: string): Temuan[] {
  const hasil: Temuan[] = [];
  teks.split(/\r?\n/).forEach((baris, i) => {
    for (const p of POLA) {
      if (p.re.test(baris)) hasil.push({ jenis: p.jenis, baris: i + 1, cuplikan: baris.trim().slice(0, 40) + "…" });
    }
    if (adaJwtServiceRole(baris)) hasil.push({ jenis: "JWT service_role Supabase", baris: i + 1, cuplikan: baris.trim().slice(0, 20) + "…" });
  });
  return hasil;
}
