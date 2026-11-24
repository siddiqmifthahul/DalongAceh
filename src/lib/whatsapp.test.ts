import { describe, expect, it } from "vitest";
import { formatWA, normalWA, pesanCepat, pesanLengkap, waUrl } from "./whatsapp";

describe("whatsapp", () => {
  it("menormalkan berbagai format nomor", () => {
    expect(normalWA("0822-6145-1487")).toBe("6282261451487");
    expect(normalWA("+62 822 6145 1487")).toBe("6282261451487");
    expect(normalWA("6282261451487")).toBe("6282261451487");
  });
  it("menolak nomor yang bukan HP Indonesia", () => {
    expect(normalWA("081234")).toBeNull();
    expect(normalWA("021-555-1234")).toBeNull();
    expect(normalWA("abc")).toBeNull();
    expect(normalWA("")).toBeNull();
  });
  it("format tampilan", () => {
    expect(formatWA("6282261451487")).toBe("0822-6145-1487");
  });
  it("URL wa.me: nomor hanya angka dan teks ter-encode", () => {
    const url = waUrl("0822-6145-1487", "Halo & salam\nbaris 2?")!;
    expect(url).toBe("https://wa.me/6282261451487?text=Halo%20%26%20salam%0Abaris%202%3F");
    expect(waUrl("bukan nomor", "x")).toBeNull();
  });
  it("teks berbahaya tidak bisa menyusup ke URL", () => {
    const url = waUrl("6282261451487", "\"><script>alert(1)</script>")!;
    expect(url).not.toContain("<");
    expect(url).not.toContain("\"");
  });
  it("pesan cepat berisi nama produk dan harga", () => {
    const t = pesanCepat({ nama: "Daging Sapi Meugang", harga: 180000, satuan: "kg" }, false);
    expect(t).toContain("Daging Sapi Meugang");
    expect(t).toContain("Rp 180.000/kg");
    expect(pesanCepat({ nama: "Kari", harga: 1, satuan: "paket" }, true)).toContain("kuotanya sudah habis");
  });
  it("pesan lengkap berisi kode, item, total, dan jadwal", () => {
    const t = pesanLengkap({
      kode: "MK-7Q4XK2PD", nama: "Nur", noHp: "6281234567890", metode: "antar", alamat: "Jl. Teuku Umar No. 5", slot: "Sabtu 05.30", catatan: null,
      items: [{ produkId: "sapi", nama: "Daging Sapi Meugang", jumlah: 3, hargaSatuan: 180000, satuan: "kg" }], total: 540000
    }, "Meugang Ramadan 2027");
    expect(t).toContain("Kode: MK-7Q4XK2PD");
    expect(t).toContain("- Daging Sapi Meugang x 3 kg = Rp 540.000");
    expect(t).toContain("Total: Rp 540.000");
    expect(t).toContain("Antar: Sabtu 05.30");
    expect(t).toContain("Alamat: Jl. Teuku Umar No. 5");
    expect(t).toContain("Catatan: -");
    expect(t).toContain("No. WA: 0812-3456-7890");
  });
});
