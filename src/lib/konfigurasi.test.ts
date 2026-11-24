import { describe, expect, it } from "vitest";
import vercel from "../../vercel.json";

const header = (k: string) => vercel.headers[0].headers.find(h => h.key === k)?.value ?? "";
const csp = Object.fromEntries(header("Content-Security-Policy").split(";").map(d => {
  const [nama, ...nilai] = d.trim().split(/\s+/);
  return [nama, nilai];
}));

describe("konfigurasi keamanan vercel.json", () => {
  it("rewrite SPA ke index.html (rute /admin tidak 404)", () => {
    expect(vercel.rewrites[0]).toEqual({ source: "/(.*)", destination: "/index.html" });
  });
  it("CSP ketat: tanpa unsafe-eval, tanpa wildcard, script hanya dari domain sendiri", () => {
    expect(header("Content-Security-Policy")).not.toMatch(/unsafe-eval|\*/);
    expect(csp["script-src"]).toEqual(["'self'"]);
    expect(csp["frame-ancestors"]).toEqual(["'none'"]);
    expect(csp["object-src"]).toEqual(["'none'"]);
    expect(csp["style-src"]).toEqual(["'self'"]);
  });
  it("hanya boleh terhubung ke project Supabase milik toko", () => {
    const luar = csp["connect-src"].filter((s: string) => s !== "'self'");
    expect(luar.every((s: string) => /^(https|wss):\/\/hkpfwtlnjqnyrlylgfsd\.supabase\.co$/.test(s))).toBe(true);
  });
  it("header keamanan wajib ada", () => {
    expect(header("Strict-Transport-Security")).toMatch(/max-age=\d{8}/);
    expect(header("X-Frame-Options")).toBe("DENY");
    expect(header("X-Content-Type-Options")).toBe("nosniff");
    expect(header("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header("Permissions-Policy")).toMatch(/camera=\(\)/);
  });
});
