import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetDemo, sumberDemo } from "./demo";

const db = sumberDemo();
const dasar = { nama: "Nur", noHp: "6281234567890", metode: "ambil" as const, alamat: "", slot: "Sabtu, 6 Feb 2027, 05.30–07.30", catatan: "" };
const sisaDari = async (id: string) => { const p = (await db.semuaProduk()).find(x => x.id === id)!; return p.kuota - p.terpesan; };

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.useRealTimers();
  resetDemo();
});

describe("aturan bisnis mode demo", () => {
  it("pesanan mengurangi kuota dan tersimpan dengan kode unik", async () => {
    const awal = await sisaDari("sapi");
    const { kode, pesanan } = await db.buatPesanan({ ...dasar, items: [{ produkId: "sapi", jumlah: 3 }] });
    expect(kode).toMatch(/^MK-[A-HJ-NP-Z2-9]{8}$/);
    expect(pesanan.total).toBe(540000);
    expect(await sisaDari("sapi")).toBe(awal - 3);
    expect((await db.daftarPesanan())[0].kode).toBe(kode);
  });
  it("menolak pesanan melebihi kuota (tidak ada perubahan data)", async () => {
    await expect(db.buatPesanan({ ...dasar, items: [{ produkId: "keukarah", jumlah: 5 }] })).rejects.toThrow(/Kuota/);
    expect(await sisaDari("keukarah")).toBe(4);
  });
  it("menolak slot di luar daftar dan PO yang sudah tutup", async () => {
    await expect(db.buatPesanan({ ...dasar, slot: "Kapan saja", items: [{ produkId: "sapi", jumlah: 1 }] })).rejects.toThrow(/Jam ambil/);
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-03-01T00:00:00+07:00"));
    await expect(db.buatPesanan({ ...dasar, items: [{ produkId: "sapi", jumlah: 1 }] })).rejects.toThrow(/PO sudah ditutup/);
  });
  it("status Batal mengembalikan kuota, diaktifkan lagi mengambil kuota", async () => {
    const { kode } = await db.buatPesanan({ ...dasar, items: [{ produkId: "timphan", jumlah: 4 }] });
    const setelahPesan = await sisaDari("timphan");
    await db.ubahStatus(kode, "batal");
    expect(await sisaDari("timphan")).toBe(setelahPesan + 4);
    await db.ubahStatus(kode, "dp");
    expect(await sisaDari("timphan")).toBe(setelahPesan);
  });
  it("cek pesanan butuh kode + 4 digit terakhir nomor HP", async () => {
    const { kode } = await db.buatPesanan({ ...dasar, items: [{ produkId: "bhoi", jumlah: 1 }] });
    expect(await db.cekPesanan(kode, "7890")).toMatchObject({ kode, status: "baru" });
    expect(await db.cekPesanan(kode, "0000")).toBeNull();
    const r = await db.cekPesanan(kode, "7890");
    expect(r && "nama" in r).toBe(false); // tidak membocorkan nama/no HP
  });
  it("CRUD produk: tambah, ubah, hapus", async () => {
    await db.simpanProduk({ nama: "Dodol Aceh", kategori: "kue", satuan: "kotak", harga: 50000, kuota: 20, deskripsi: "Dodol legit khas Aceh.",
      ciri: ["Legit"], momen: ["meugang"], foto: "/img/bhoi.jpg", fokus: "50% 50%", aktif: true, urutan: 9 });
    let semua = await db.semuaProduk();
    const baru = semua.find(p => p.nama === "Dodol Aceh")!;
    expect(semua).toHaveLength(9);
    await db.simpanProduk({ ...baru, harga: 55000 });
    expect((await db.semuaProduk()).find(p => p.id === baru.id)!.harga).toBe(55000);
    await db.hapusProduk(baru.id);
    semua = await db.semuaProduk();
    expect(semua).toHaveLength(8);
  });
});
