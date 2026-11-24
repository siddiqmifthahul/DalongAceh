import { describe, expect, it } from "vitest";
import { ALFABET_KODE, buatKode, kodeValid, rapikanKode } from "./kode";

describe("kode pesanan", () => {
  it("format MK- + 8 karakter tanpa karakter ambigu", () => {
    for (let i = 0; i < 200; i++) {
      const k = buatKode();
      expect(kodeValid(k)).toBe(true);
      expect(k).not.toMatch(/[O0I1]/);
    }
  });
  it("alfabet 32 karakter (modulo tidak bias)", () => {
    expect(ALFABET_KODE).toHaveLength(32);
  });
  it("menghindari kode yang sudah dipakai", () => {
    let n = 0;
    const acak = (arr: Uint32Array<ArrayBuffer>) => { arr.fill(n++); return arr; };
    const pertama = buatKode(() => false, acak);
    n = 0;
    const kedua = buatKode(k => k === pertama, acak);
    expect(kedua).not.toBe(pertama);
  });
  it("menolak format yang salah", () => {
    expect(kodeValid("MK-7Q4XK2P")).toBe(false);
    expect(kodeValid("MK-7Q4XK2PO")).toBe(false);
    expect(kodeValid("mk-7q4xk2pd")).toBe(false);
    expect(kodeValid("<script>")).toBe(false);
  });
  it("merapikan input pembeli", () => {
    expect(rapikanKode(" mk 7q4x-k2pd ")).toBe("MK-7Q4XK2PD");
  });
});
