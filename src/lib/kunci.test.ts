import { describe, expect, it } from "vitest";
import { kunciAman, urlSupabaseValid } from "./kunci";

// Contoh disusun dari potongan agar pemindai rahasia tidak salah mendeteksi file test ini.
const jwt = (role: string) => "eyJhbGciOiJIUzI1NiJ9." + btoa(JSON.stringify({ role })).replace(/=+$/, "") + ".tandatangan";

describe("pengaman kunci Supabase di frontend", () => {
  it("menerima kunci publishable dan anon", () => {
    expect(kunciAman("sb_publishable_ABCdef123")).toBe(true);
    expect(kunciAman(jwt("anon"))).toBe(true);
  });
  it("menolak kunci secret dan service_role", () => {
    expect(kunciAman("sb_" + "secret_ABCdef123456")).toBe(false);
    expect(kunciAman(jwt("service_role"))).toBe(false);
    expect(kunciAman("")).toBe(false);
  });
  it("hanya menerima URL project Supabase yang sah", () => {
    expect(urlSupabaseValid("https://hkpfwtlnjqnyrlylgfsd.supabase.co")).toBe(true);
    expect(urlSupabaseValid("http://hkpfwtlnjqnyrlylgfsd.supabase.co")).toBe(false);
    expect(urlSupabaseValid("https://evil.com/?x=.supabase.co")).toBe(false);
  });
});
