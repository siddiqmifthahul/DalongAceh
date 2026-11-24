import { describe, expect, it } from "vitest";
import { bacaCiri, validasiPesanan, validasiProduk } from "./validasi";
import type { ProdukInput } from "./types";

const SLOTS = ["Sabtu 05.30", "Sabtu 07.30"];
const formOk = { nama: "Cut Nur", noHp: "0812 3456 7890", metode: "ambil", alamat: "", slot: "Sabtu 05.30", catatan: "" };

describe("validasi pesanan", () => {
  it("menerima data yang benar dan menormalkan nomor", () => {
    const r = validasiPesanan(formOk, SLOTS);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.noHp).toBe("6281234567890");
  });
  it("menolak nama tidak wajar, termasuk tag HTML", () => {
    for (const nama of ["A", "x".repeat(51), "<script>alert(1)</script>", "Nur123"]) {
      const r = validasiPesanan({ ...formOk, nama }, SLOTS);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.galat.nama).toBeDefined();
    }
  });
  it("menolak nomor HP salah", () => {
    const r = validasiPesanan({ ...formOk, noHp: "021555" }, SLOTS);
    expect(!r.ok && r.galat.noHp).toBeTruthy();
  });
  it("alamat wajib jika diantar", () => {
    const r = validasiPesanan({ ...formOk, metode: "antar", alamat: "dekat" }, SLOTS);
    expect(!r.ok && r.galat.alamat).toBeTruthy();
    const ok = validasiPesanan({ ...formOk, metode: "antar", alamat: "Jl. Teuku Umar No. 5, Banda Aceh" }, SLOTS);
    expect(ok.ok).toBe(true);
  });
  it("slot harus dari daftar resmi", () => {
    const r = validasiPesanan({ ...formOk, slot: "Kapan saja" }, SLOTS);
    expect(!r.ok && r.galat.slot).toBeTruthy();
  });
  it("catatan tanpa tag HTML dan maks 200 karakter", () => {
    expect(validasiPesanan({ ...formOk, catatan: "<b>" }, SLOTS).ok).toBe(false);
    expect(validasiPesanan({ ...formOk, catatan: "a".repeat(201) }, SLOTS).ok).toBe(false);
  });
});

const produkOk: ProdukInput = {
  nama: "Timphan (isi 50)", kategori: "kue", satuan: "kotak", harga: 150000, kuota: 40,
  deskripsi: "Kue berbungkus daun pisang, isi srikaya.", ciri: ["Lembut", "Manis"], momen: ["kenduri"],
  foto: "/img/timphan.jpg", fokus: "50% 50%", aktif: true, urutan: 1
};

describe("validasi produk (standar data konsisten)", () => {
  it("produk valid lolos", () => {
    expect(validasiProduk(produkOk)).toEqual({});
  });
  it("harga harus bulat dan dalam rentang", () => {
    expect(validasiProduk({ ...produkOk, harga: -5 }).harga).toBeDefined();
    expect(validasiProduk({ ...produkOk, harga: 1500.5 }).harga).toBeDefined();
  });
  it("deskripsi maksimal 150 karakter", () => {
    expect(validasiProduk({ ...produkOk, deskripsi: "a".repeat(151) }).deskripsi).toBeDefined();
  });
  it("kategori di luar daftar ditolak", () => {
    expect(validasiProduk({ ...produkOk, kategori: "minuman" as never }).kategori).toBeDefined();
  });
  it("kuota tidak boleh di bawah yang sudah terpesan", () => {
    expect(validasiProduk({ ...produkOk, kuota: 10 }, 12).kuota).toBeDefined();
  });
  it("foto wajib dan alamat foto berbahaya ditolak", () => {
    expect(validasiProduk({ ...produkOk, foto: null }).foto).toBeDefined();
    expect(validasiProduk({ ...produkOk, foto: "javascript:alert(1)" }).foto).toBeDefined();
    expect(validasiProduk({ ...produkOk, foto: "data:image/svg+xml;base64,PHN2Zz4=" }).foto).toBeDefined();
  });
  it("ciri khas maks 3, tiap ciri maks 16 karakter", () => {
    expect(validasiProduk({ ...produkOk, ciri: ["a", "b", "c", "d"] }).ciri).toBeDefined();
    expect(validasiProduk({ ...produkOk, ciri: ["x".repeat(17)] }).ciri).toBeDefined();
    expect(bacaCiri(" Renyah ,  Manis,, Hantaran ")).toEqual(["Renyah", "Manis", "Hantaran"]);
  });
  it("nama dengan tag ditolak", () => {
    expect(validasiProduk({ ...produkOk, nama: "<img src=x>" }).nama).toBeDefined();
  });
});
