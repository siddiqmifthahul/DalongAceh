import { describe, expect, it } from "vitest";
import { batasiTamu, hitungPorsi } from "./kalkulator";

const semua = { masakan: "beulangong", kue: "timphan", daging: "sapi" };
const jml = (tamu: number) => Object.fromEntries(hitungPorsi(tamu, semua).map(r => [r.produkId, r.jumlah]));

describe("kalkulator porsi kenduri (pembulatan ke atas)", () => {
  it.each([
    [10, { beulangong: 1, timphan: 1, sapi: 2 }],
    [49, { beulangong: 1, timphan: 2, sapi: 7 }],
    [50, { beulangong: 1, timphan: 2, sapi: 7 }],
    [51, { beulangong: 2, timphan: 3, sapi: 7 }],
    [300, { beulangong: 6, timphan: 12, sapi: 38 }]
  ])("%i tamu", (tamu, harap) => {
    expect(jml(tamu)).toEqual(harap);
  });
  it("hanya menghitung yang dipilih", () => {
    expect(hitungPorsi(100, { masakan: null, kue: "bhoi", daging: null })).toEqual([{ produkId: "bhoi", jumlah: 4 }]);
  });
  it("jumlah tamu dibatasi 10–500", () => {
    expect(batasiTamu(1)).toBe(10);
    expect(batasiTamu(9999)).toBe(500);
    expect(batasiTamu(Number.NaN)).toBe(10);
  });
});
