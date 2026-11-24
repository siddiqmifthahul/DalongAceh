import { describe, expect, it } from "vitest";
import { hargaSatuan, kapitalAwal, rapikan, rp, sisaWaktu } from "./format";

describe("format", () => {
  it("formatRupiah: titik pemisah ribuan, tanpa desimal", () => {
    expect(rp(180000)).toBe("Rp 180.000");
    expect(rp(2500000)).toBe("Rp 2.500.000");
    expect(rp(0)).toBe("Rp 0");
    expect(rp(999.6)).toBe("Rp 1.000");
  });
  it("harga + satuan", () => {
    expect(hargaSatuan(60000, "kotak")).toBe("Rp 60.000/kotak");
  });
  it("rapikan spasi dan batas panjang", () => {
    expect(rapikan("  Daging   sapi \n segar ")).toBe("Daging sapi segar");
    expect(rapikan("abcdef", 3)).toBe("abc");
  });
  it("kapital awal", () => {
    expect(kapitalAwal("timphan")).toBe("Timphan");
  });
  it("sisa waktu countdown", () => {
    const now = Date.parse("2027-02-04T18:00:00+07:00");
    expect(sisaWaktu("2027-02-05T20:30:00+07:00", now)).toEqual({ hari: 1, jam: 2, menit: 30, selesai: false });
    expect(sisaWaktu("2027-02-04T17:00:00+07:00", now).selesai).toBe(true);
  });
});
