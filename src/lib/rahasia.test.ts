import { describe, expect, it } from "vitest";
import { cariRahasia } from "./rahasia";

// String uji dirakit dari potongan supaya file ini sendiri tidak terdeteksi sebagai rahasia.
const SECRET = "sb_" + "secret_" + "A1b2C3d4E5f6G7h8I9j0";
const PRIV = "-----BEGIN " + "PRIVATE KEY-----";
const DBURL = "postgres" + "ql://postgres:" + "RahasiaSekali123" + "@db.contoh.supabase.co:5432/postgres";
const SR = "eyJhbGciOiJIUzI1NiJ9." + btoa(JSON.stringify({ role: "service_" + "role" })).replace(/=+$/, "") + ".tandatanganpalsu";

describe("pemindai rahasia (npm run cek:rahasia)", () => {
  it("mendeteksi kunci secret, private key, URL database, dan JWT service_role", () => {
    expect(cariRahasia("const k = '" + SECRET + "';")[0].jenis).toMatch(/secret/i);
    expect(cariRahasia(PRIV)).toHaveLength(1);
    expect(cariRahasia("DATABASE_URL=" + DBURL)[0].jenis).toMatch(/URL database/);
    expect(cariRahasia("KEY=" + SR).some(t => /service_role/.test(t.jenis))).toBe(true);
    expect(cariRahasia("DB_" + "PASSWORD=SuperRahasia99")[0].jenis).toMatch(/Variabel rahasia/);
  });
  it("tidak salah mendeteksi kunci publik atau teks biasa", () => {
    expect(cariRahasia("VITE_SUPABASE_ANON_KEY=sb_publishable_ABCdef123456789")).toEqual([]);
    expect(cariRahasia("if (k.startsWith(\"sb_secret_\")) return false;")).toEqual([]);
    expect(cariRahasia("Password minimal 12 karakter.")).toEqual([]);
  });
  it("melaporkan nomor baris", () => {
    expect(cariRahasia("baris satu\nbaris dua " + SECRET)[0].baris).toBe(2);
  });
});
