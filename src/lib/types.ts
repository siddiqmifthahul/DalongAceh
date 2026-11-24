export type Kategori = "daging" | "masakan" | "kue";
export type Satuan = "kg" | "paket" | "kotak";
export type Momen = "meugang" | "kenduri";
export type StatusPesanan = "baru" | "dp" | "lunas" | "diambil" | "batal";
export type Metode = "ambil" | "antar";

export const KATEGORI: Record<Kategori, string> = {
  daging: "Daging Meugang",
  masakan: "Masakan Kenduri",
  kue: "Kue Tradisional"
};
export const SATUAN: Satuan[] = ["kg", "paket", "kotak"];
export const MOMEN: Record<Momen, string> = { meugang: "Meugang", kenduri: "Kenduri" };
export const STATUS: Record<StatusPesanan, { label: string; nada: "warn" | "ok" | "off" | "danger" }> = {
  baru: { label: "Baru, menunggu konfirmasi", nada: "warn" },
  dp: { label: "DP diterima", nada: "ok" },
  lunas: { label: "Lunas", nada: "ok" },
  diambil: { label: "Sudah diambil", nada: "off" },
  batal: { label: "Dibatalkan", nada: "danger" }
};

export interface Produk {
  id: string;
  nama: string;
  kategori: Kategori;
  satuan: Satuan;
  harga: number;
  deskripsi: string;
  ciri: string[];
  foto: string | null;
  fokus: string; // object-position untuk potongan 4:3, mis. "50% 40%"
  momen: Momen[];
  kuota: number;
  terpesan: number;
  aktif: boolean;
  urutan: number;
}

export type ProdukInput = Omit<Produk, "id" | "terpesan"> & { id?: string };

export interface ItemPesanan {
  produkId: string | null;
  nama: string;
  jumlah: number;
  hargaSatuan: number;
  satuan: Satuan;
}

export interface Pesanan {
  kode: string;
  waktu: string;
  sumber: "web" | "manual";
  nama: string;
  noHp: string;
  metode: Metode;
  alamat: string | null;
  slot: string;
  catatan: string | null;
  status: StatusPesanan;
  items: ItemPesanan[];
  total: number;
}

/** Ringkasan pesanan untuk pembeli (tanpa nama & nomor HP). */
export interface RingkasanPesanan {
  kode: string;
  status: StatusPesanan;
  metode: Metode;
  slot: string;
  total: number;
  items: { nama: string; jumlah: number; satuan: Satuan }[];
}

export interface PesananBaru {
  nama: string;
  noHp: string;
  metode: Metode;
  alamat: string;
  slot: string;
  catatan: string;
  items: { produkId: string; jumlah: number }[];
}

export interface Pengaturan {
  namaUsaha: string;
  noWhatsApp: string; // format 62xxxxxxxxxx
  momenLabel: string;
  poTutup: string; // ISO date
  slots: string[];
}

export interface ItemKeranjang {
  produkId: string;
  jumlah: number;
}
