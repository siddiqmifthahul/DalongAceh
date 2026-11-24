import { describe, expect, it } from "vitest";
import { bolehBergerak, geserParalaks, jarakDariPusat, jedaBertahap } from "./gerak";

describe("gerak", () => {
  it("jeda bertahap naik per elemen lalu berhenti di batas", () => {
    expect(jedaBertahap(0)).toBe(0);
    expect(jedaBertahap(3)).toBe(270);
    expect(jedaBertahap(20)).toBe(720);
    expect(jedaBertahap(2, 100, 1)).toBe(100);
  });

  it("jeda tidak negatif untuk masukan aneh", () => {
    expect(jedaBertahap(-4)).toBe(0);
    expect(jedaBertahap(Number.NaN)).toBe(0);
    expect(jedaBertahap(2.7)).toBe(180);
  });

  it("paralaks nol di tengah, ±kekuatan di tepi, dan terbatas di luar kotak", () => {
    expect(geserParalaks(200, 100, 400, 200)).toEqual({ dx: 0, dy: 0 });
    expect(geserParalaks(0, 200, 400, 200, 10)).toEqual({ dx: -10, dy: 10 });
    expect(geserParalaks(9999, -500, 400, 200, 8)).toEqual({ dx: 8, dy: -8 });
  });

  it("paralaks aman jika ukuran kotak nol", () => {
    expect(geserParalaks(10, 10, 0, 0)).toEqual({ dx: 0, dy: 0 });
  });

  it("jarak dari pusat elips", () => {
    expect(jarakDariPusat({ x: 50, y: 7 })).toEqual({ dx: 0, dy: 43 });
    expect(jarakDariPusat({ x: 85, y: 73 })).toEqual({ dx: -35, dy: -23 });
  });

  it("gerak mati jika pengguna meminta gerak dikurangi atau browser tidak mendukung", () => {
    expect(bolehBergerak(false, true)).toBe(true);
    expect(bolehBergerak(true, true)).toBe(false);
    expect(bolehBergerak(false, false)).toBe(false);
  });
});
