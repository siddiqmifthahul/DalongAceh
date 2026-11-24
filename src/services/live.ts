import type { SupabaseClient } from "@supabase/supabase-js";
import type { Pengaturan, Pesanan, PesananBaru, Produk, ProdukInput, RingkasanPesanan, StatusPesanan } from "../lib/types";
import { isPengaturan, isProduk, isStatus } from "../lib/skema";
import { GalatPengguna, type SumberData } from "./types";

/* ---- pemetaan kolom snake_case <-> camelCase, sekaligus validasi data dari server ---- */
interface BarisProduk {
  id: string; nama: string; kategori: string; satuan: string; harga: number; deskripsi: string; ciri: string[];
  foto: string | null; fokus: string; momen: string[]; kuota: number; terpesan: number; aktif: boolean; urutan: number;
}
const keProduk = (r: BarisProduk): Produk => ({
  id: r.id, nama: r.nama, kategori: r.kategori as Produk["kategori"], satuan: r.satuan as Produk["satuan"], harga: r.harga,
  deskripsi: r.deskripsi, ciri: r.ciri ?? [], foto: r.foto, fokus: r.fokus, momen: r.momen as Produk["momen"],
  kuota: r.kuota, terpesan: r.terpesan, aktif: r.aktif, urutan: r.urutan
});
const dariProduk = (p: ProdukInput) => ({
  nama: p.nama, kategori: p.kategori, satuan: p.satuan, harga: p.harga, deskripsi: p.deskripsi, ciri: p.ciri,
  foto: p.foto, fokus: p.fokus, momen: p.momen, kuota: p.kuota, aktif: p.aktif, urutan: p.urutan
});

const KOLOM_PRODUK = "id,nama,kategori,satuan,harga,deskripsi,ciri,foto,fokus,momen,kuota,terpesan,aktif,urutan";

/** Pesan galat dari server yang aman diteruskan ke pembeli; selain itu disamarkan. */
function galatRamah(e: { message?: string } | null, cadangan: string): Error {
  const m = e?.message ?? "";
  const aman = /^(PO sudah ditutup|Jam ambil tidak valid|Isi pesanan tidak valid|Terlalu banyak pesanan|Sedang banyak pesanan|Ada produk yang sudah tidak tersedia|Kuota .+ tidak cukup|Toko belum siap)/;
  if (aman.test(m)) return new GalatPengguna(m);
  if (/violates check constraint/.test(m)) return new GalatPengguna("Data yang dikirim tidak sesuai aturan. Periksa lagi isian Anda.");
  console.error("[supabase]", m);
  return new GalatPengguna(cadangan);
}

export function sumberLive(db: SupabaseClient): SumberData {
  return {
    mode: "live",

    async daftarProduk() {
      const { data, error } = await db.from("produk").select(KOLOM_PRODUK).eq("aktif", true).order("urutan");
      if (error) throw galatRamah(error, "Daftar produk gagal dimuat. Periksa koneksi lalu muat ulang.");
      return (data as BarisProduk[]).map(keProduk).filter(isProduk);
    },

    async semuaProduk() {
      const { data, error } = await db.from("produk").select(KOLOM_PRODUK).order("urutan");
      if (error) throw galatRamah(error, "Daftar produk gagal dimuat.");
      return (data as BarisProduk[]).map(keProduk).filter(isProduk);
    },

    async pengaturan() {
      const { data, error } = await db.from("pengaturan").select("nama_usaha,no_whatsapp,momen_label,po_tutup,slots").eq("id", 1).single();
      if (error) throw galatRamah(error, "Pengaturan toko gagal dimuat.");
      const s: Pengaturan = { namaUsaha: data.nama_usaha, noWhatsApp: data.no_whatsapp, momenLabel: data.momen_label, poTutup: data.po_tutup, slots: data.slots };
      if (!isPengaturan(s)) throw new GalatPengguna("Pengaturan toko tidak valid.");
      return s;
    },

    async buatPesanan(input: PesananBaru) {
      const { data, error } = await db.rpc("buat_pesanan", {
        p_nama: input.nama, p_no_hp: input.noHp, p_metode: input.metode, p_alamat: input.alamat,
        p_slot: input.slot, p_catatan: input.catatan,
        p_items: input.items.map(i => ({ produk_id: i.produkId, jumlah: i.jumlah }))
      });
      if (error) throw galatRamah(error, "Pesanan gagal dikirim. Coba lagi sebentar.");
      const kode = String(data);
      // Ambil harga & nama terbaru untuk menyusun pesan WhatsApp (dari daftar produk publik)
      const produk = await this.daftarProduk();
      const peta = new Map(produk.map(p => [p.id, p]));
      const items = input.items.map(i => {
        const p = peta.get(i.produkId);
        return { produkId: i.produkId, nama: p?.nama ?? "Produk", jumlah: i.jumlah, hargaSatuan: p?.harga ?? 0, satuan: p?.satuan ?? "kg" };
      });
      const pesanan: Pesanan = {
        kode, waktu: new Date().toISOString(), sumber: "web", nama: input.nama, noHp: input.noHp, metode: input.metode,
        alamat: input.metode === "antar" ? input.alamat : null, slot: input.slot, catatan: input.catatan || null, status: "baru",
        items, total: items.reduce((t, i) => t + i.jumlah * i.hargaSatuan, 0)
      };
      return { kode, pesanan };
    },

    async cekPesanan(kode, hp4) {
      const { data, error } = await db.rpc("cek_pesanan", { p_kode: kode, p_hp4: hp4 });
      if (error) throw galatRamah(error, "Pesanan gagal dicek. Coba lagi.");
      if (!data) return null;
      const r = data as RingkasanPesanan;
      return isStatus(r.status) ? r : null;
    },

    async simpanProduk(p) {
      const isi = dariProduk(p);
      const { error } = p.id
        ? await db.from("produk").update(isi).eq("id", p.id)
        : await db.from("produk").insert(isi);
      if (error) throw galatRamah(error, "Produk gagal disimpan.");
    },

    async hapusProduk(id) {
      const { error } = await db.from("produk").delete().eq("id", id);
      if (error) throw galatRamah(error, "Produk gagal dihapus.");
    },

    async unggahFoto(foto) {
      const nama = crypto.randomUUID() + ".webp";
      const { error } = await db.storage.from("foto-produk").upload(nama, foto, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
      if (error) throw galatRamah(error, "Foto gagal diunggah.");
      return db.storage.from("foto-produk").getPublicUrl(nama).data.publicUrl;
    },

    async daftarPesanan() {
      const { data, error } = await db.from("pesanan")
        .select("kode,created_at,sumber,nama,no_hp,metode,alamat,slot,catatan,status,total,pesanan_item(produk_id,nama,jumlah,harga_satuan,satuan)")
        .order("created_at", { ascending: false }).limit(500);
      if (error) throw galatRamah(error, "Daftar pesanan gagal dimuat.");
      return (data ?? []).map((r): Pesanan => ({
        kode: r.kode, waktu: r.created_at, sumber: r.sumber, nama: r.nama, noHp: r.no_hp, metode: r.metode, alamat: r.alamat,
        slot: r.slot, catatan: r.catatan, status: r.status, total: r.total,
        items: (r.pesanan_item ?? []).map((i: { produk_id: string | null; nama: string; jumlah: number; harga_satuan: number; satuan: string }) => ({
          produkId: i.produk_id, nama: i.nama, jumlah: i.jumlah, hargaSatuan: i.harga_satuan, satuan: i.satuan as Produk["satuan"]
        }))
      }));
    },

    async ubahStatus(kode, status: StatusPesanan) {
      const { error } = await db.from("pesanan").update({ status }).eq("kode", kode);
      if (error) throw galatRamah(error, "Status gagal diubah.");
    },

    async simpanPengaturan(s) {
      const { error } = await db.from("pengaturan").update({
        nama_usaha: s.namaUsaha, no_whatsapp: s.noWhatsApp, momen_label: s.momenLabel, po_tutup: s.poTutup, slots: s.slots
      }).eq("id", 1);
      if (error) throw galatRamah(error, "Pengaturan gagal disimpan.");
    }
  };
}
