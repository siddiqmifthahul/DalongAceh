import { describe, expect, it } from "vitest";
import { FILTER_AWAL, hitungPerMomen, jumlahFilterAktif, persenSisa, saringProduk, sisa, statusKuota } from "./katalog";
import { PRODUK_AWAL } from "./seed";

const ids = (l: { id: string }[]) => l.map(p => p.id);

describe("kuota", () => {
  it("sisa tidak pernah negatif", () => {
    expect(sisa({ kuota: 5, terpesan: 7 })).toBe(0);
    expect(sisa({ kuota: 10, terpesan: 4 })).toBe(6);
  });
  it("status: habis, hampir (≤20%), ada", () => {
    expect(statusKuota({ kuota: 6, terpesan: 6 })).toBe("habis");
    expect(statusKuota({ kuota: 50, terpesan: 46 })).toBe("hampir");
    expect(statusKuota({ kuota: 100, terpesan: 38 })).toBe("ada");
    expect(persenSisa({ kuota: 0, terpesan: 0 })).toBe(0);
  });
});

describe("pencarian, filter, sorting", () => {
  it("8 produk awal tampil berurutan", () => {
    expect(saringProduk(PRODUK_AWAL, FILTER_AWAL)).toHaveLength(8);
    expect(ids(saringProduk(PRODUK_AWAL, FILTER_AWAL))[0]).toBe("sapi");
  });
  it("pencarian tidak peka huruf besar dan ikut mencari ciri khas", () => {
    expect(ids(saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, q: "TIMPHAN" }))).toEqual(["timphan"]);
    expect(ids(saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, q: "renyah" }))).toEqual(["bhoi", "keukarah"]);
    expect(saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, q: "pizza" })).toHaveLength(0);
  });
  it("filter kategori dan momen", () => {
    expect(saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, kategori: "masakan" })).toHaveLength(2);
    expect(saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, momen: "kenduri" })).toHaveLength(5);
    expect(saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, momen: "meugang" })).toHaveLength(6);
  });
  it("sembunyikan yang habis dan harga maksimal", () => {
    expect(ids(saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, sembunyikanHabis: true }))).not.toContain("kari");
    expect(saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, hargaMaks: 150000 }).every(p => p.harga <= 150000)).toBe(true);
  });
  it("kombinasi filter", () => {
    const r = saringProduk(PRODUK_AWAL, { ...FILTER_AWAL, kategori: "kue", momen: "kenduri", hargaMaks: 130000 });
    expect(ids(r).sort()).toEqual(["bhoi", "keukarah"]);
  });
  it("sorting: murah, mahal, nama, sisa", () => {
    const murah = saringProduk(PRODUK_AWAL, FILTER_AWAL, "murah");
    expect(murah[0].id).toBe("keukarah");
    expect(saringProduk(PRODUK_AWAL, FILTER_AWAL, "mahal")[0].id).toBe("kari");
    expect(saringProduk(PRODUK_AWAL, FILTER_AWAL, "nama")[0].id).toBe("kerbau"); // "Daging Kerbau" < "Daging Sapi"
    expect(saringProduk(PRODUK_AWAL, FILTER_AWAL, "sisa")[0].id).toBe("sapi");
  });
  it("produk nonaktif tidak tampil", () => {
    const list = PRODUK_AWAL.map(p => (p.id === "sapi" ? { ...p, aktif: false } : p));
    expect(ids(saringProduk(list, FILTER_AWAL))).not.toContain("sapi");
  });
  it("hitung filter aktif dan jumlah per momen", () => {
    expect(jumlahFilterAktif(FILTER_AWAL)).toBe(0);
    expect(jumlahFilterAktif({ ...FILTER_AWAL, momen: "meugang", sembunyikanHabis: true, hargaMaks: 100000 })).toBe(3);
    expect(hitungPerMomen(PRODUK_AWAL)).toEqual({ semua: 8, meugang: 6, kenduri: 5 });
  });
});
