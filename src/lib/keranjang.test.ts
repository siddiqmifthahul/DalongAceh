import { describe, expect, it } from "vitest";
import { aturJumlah, jumlahItem, sesuaikanKeranjang, tambahKeKeranjang, totalKeranjang } from "./keranjang";
import { PRODUK_AWAL } from "./seed";

const p = (id: string) => PRODUK_AWAL.find(x => x.id === id)!;

describe("keranjang", () => {
  it("menambah dan menghitung total", () => {
    let { cart } = tambahKeKeranjang([], p("sapi"), 3);
    ({ cart } = tambahKeKeranjang(cart, p("timphan"), 2));
    expect(totalKeranjang(cart, PRODUK_AWAL)).toBe(3 * 180000 + 2 * 150000);
    expect(jumlahItem(cart)).toBe(5);
  });
  it("tidak bisa melebihi sisa kuota", () => {
    const keukarah = p("keukarah"); // sisa 4
    const r = tambahKeKeranjang([], keukarah, 10);
    expect(r.cart[0].jumlah).toBe(4);
    expect(r.ditambah).toBe(4);
    expect(tambahKeKeranjang(r.cart, keukarah, 1).ditambah).toBe(0);
  });
  it("produk habis tidak bisa ditambah", () => {
    expect(tambahKeKeranjang([], p("kari"), 1)).toEqual({ cart: [], ditambah: 0 });
  });
  it("atur jumlah: dibatasi kuota, 0 menghapus", () => {
    const { cart } = tambahKeKeranjang([], p("sapi"), 1);
    expect(aturJumlah(cart, p("sapi"), 999)[0].jumlah).toBe(62);
    expect(aturJumlah(cart, p("sapi"), 0)).toEqual([]);
  });
  it("menyesuaikan keranjang jika kuota/produk berubah", () => {
    const cart = [{ produkId: "sapi", jumlah: 70 }, { produkId: "hilang", jumlah: 1 }, { produkId: "kari", jumlah: 1 }];
    expect(sesuaikanKeranjang(cart, PRODUK_AWAL)).toEqual([{ produkId: "sapi", jumlah: 62 }]);
  });
});
