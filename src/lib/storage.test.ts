import { beforeEach, describe, expect, it, vi } from "vitest";
import { bacaAman, tulisAman } from "./storage";
import { arrayOf, isItemKeranjang, isPengaturan, isPesanan, isProduk } from "./skema";
import { PENGATURAN_AWAL, PRODUK_AWAL } from "./seed";

const isCart = arrayOf(isItemKeranjang, 20);
const isListProduk = arrayOf(isProduk, 30);

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("localStorage dengan validasi", () => {
  it("data valid terbaca kembali", () => {
    const cart = [{ produkId: "sapi", jumlah: 2 }];
    expect(tulisAman("k", cart, isCart).ok).toBe(true);
    expect(bacaAman("k", isCart, [])).toEqual(cart);
  });
  it("JSON rusak kembali ke data awal tanpa crash, lalu dibersihkan", () => {
    localStorage.setItem("k", "{bukan json");
    expect(bacaAman("k", isCart, [])).toEqual([]);
    expect(localStorage.getItem("k")).toBeNull();
  });
  it("data yang diubah lewat DevTools ditolak", () => {
    localStorage.setItem("k", JSON.stringify([{ produkId: "sapi", jumlah: -5 }]));
    expect(bacaAman("k", isCart, [])).toEqual([]);
    const jahat = PRODUK_AWAL.map(p => ({ ...p, nama: "<img src=x onerror=alert(1)>" }));
    localStorage.setItem("p", JSON.stringify(jahat));
    expect(bacaAman("p", isListProduk, PRODUK_AWAL)).toBe(PRODUK_AWAL);
    localStorage.setItem("p", JSON.stringify(PRODUK_AWAL.map(p => ({ ...p, terpesan: p.kuota + 1 }))));
    expect(bacaAman("p", isListProduk, PRODUK_AWAL)).toBe(PRODUK_AWAL);
  });
  it("tidak menulis data yang tidak valid", () => {
    expect(tulisAman("k", [{ produkId: "", jumlah: 0 }], isCart)).toEqual({ ok: false, alasan: "tidak-valid" });
    expect(localStorage.getItem("k")).toBeNull();
  });
  it("penyimpanan penuh ditangani", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("penuh", "QuotaExceededError");
    });
    expect(tulisAman("k", [], isCart)).toEqual({ ok: false, alasan: "penuh" });
    spy.mockRestore();
  });
  it("data awal semuanya valid menurut skema", () => {
    expect(isListProduk(PRODUK_AWAL)).toBe(true);
    expect(isPengaturan(PENGATURAN_AWAL)).toBe(true);
  });
  it("skema pesanan", () => {
    const o = {
      kode: "MK-7Q4XK2PD", waktu: new Date().toISOString(), sumber: "web", nama: "Nur", noHp: "6281234567890", metode: "ambil",
      alamat: null, slot: "Sabtu", catatan: null, status: "baru", total: 180000,
      items: [{ produkId: "sapi", nama: "Daging Sapi Meugang", jumlah: 1, hargaSatuan: 180000, satuan: "kg" }]
    };
    expect(isPesanan(o)).toBe(true);
    expect(isPesanan({ ...o, status: "dicuri" })).toBe(false);
    expect(isPesanan({ ...o, kode: "MK-1" })).toBe(false);
  });
});
