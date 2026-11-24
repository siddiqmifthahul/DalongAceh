import { beforeEach, describe, expect, it } from "vitest";
import { cobaLogin, keluarDemo, KUNCI_MS, loginDemo, sesiDemoAktif, SESI_MS } from "./authDemo";
import { areaPotong, cekFileFoto } from "./foto";

const awal = { jumlah: 0, kunciSampai: 0 };

describe("login demo admin/admin", () => {
  beforeEach(() => sessionStorage.clear());

  it("admin/admin berhasil", () => {
    expect(cobaLogin("admin", "admin", awal, 0).hasil).toEqual({ ok: true });
  });
  it("salah memberi sisa percobaan", () => {
    expect(cobaLogin("admin", "salah", awal, 0).hasil).toEqual({ ok: false, alasan: "salah", sisaPercobaan: 4 });
  });
  it("salah 5x terkunci 5 menit, lalu terbuka lagi", () => {
    let g = awal;
    let hasil;
    for (let i = 0; i < 5; i++) ({ hasil, gagal: g } = cobaLogin("admin", "x", g, 1000));
    expect(hasil).toEqual({ ok: false, alasan: "terkunci", menit: 5 });
    expect(cobaLogin("admin", "admin", g, 1000 + KUNCI_MS - 1).hasil.ok).toBe(false);
    expect(cobaLogin("admin", "admin", g, 1000 + KUNCI_MS + 1).hasil.ok).toBe(true);
  });
  it("sesi dibuat, kedaluwarsa 30 menit, dan bisa keluar", () => {
    expect(loginDemo("admin", "admin", 0).ok).toBe(true);
    expect(sesiDemoAktif(SESI_MS - 1)).toBe(true);
    expect(sesiDemoAktif(SESI_MS + 1)).toBe(false);
    loginDemo("admin", "admin", 0);
    keluarDemo();
    expect(sesiDemoAktif(1)).toBe(false);
  });
  it("sesi palsu di sessionStorage ditolak", () => {
    sessionStorage.setItem("mk:v1:demo:sesi", "\"exp\"");
    expect(sesiDemoAktif()).toBe(false);
  });
});

describe("foto produk", () => {
  it("hanya JPG/PNG/WebP, SVG ditolak, maks 5 MB", () => {
    expect(cekFileFoto({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(cekFileFoto({ type: "image/svg+xml", size: 10 })).toMatch(/Format/);
    expect(cekFileFoto({ type: "image/png", size: 6 * 1024 * 1024 })).toMatch(/5 MB/);
  });
  it("area potong tengah 4:3", () => {
    expect(areaPotong(1600, 900)).toEqual({ sx: 200, sy: 0, sw: 1200, sh: 900 });
    expect(areaPotong(900, 1600)).toEqual({ sx: 0, sy: 462.5, sw: 900, sh: 675 });
  });
});
