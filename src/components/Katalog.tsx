import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Icon } from "./Icon";
import { FilterPanel } from "./FilterPanel";
import { ProductCard } from "./ProductCard";
import { FILTER_AWAL, hitungPerMomen, jumlahFilterAktif, saringProduk, type Filter, type Urutan } from "../lib/katalog";
import { KATEGORI, type Kategori, type Produk } from "../lib/types";
import { useData } from "../state/data";
import { useKeranjang } from "../state/keranjang";
import { useToast } from "../state/toast";

const CHIP: (Kategori | "semua")[] = ["semua", "daging", "masakan", "kue"];

export function Katalog() {
  const { produk, pengaturan, status, galat, muatUlang } = useData();
  const keranjang = useKeranjang();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>(FILTER_AWAL);
  const [urutan, setUrutan] = useState<Urutan>("default");
  const [sheet, setSheet] = useState(false);
  const q = useDeferredValue(filter.q);

  const hasil = useMemo(() => saringProduk(produk, { ...filter, q }, urutan), [produk, filter, q, urutan]);
  const aktif = jumlahFilterAktif(filter);
  const poBuka = Date.now() < Date.parse(pengaturan.poTutup);

  useEffect(() => {
    if (!sheet) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [sheet]);

  const tambah = (p: Produk) => {
    const n = keranjang.tambah(p, 1);
    toast(n > 0 ? p.nama + " masuk keranjang" : "Kuota " + p.nama + " sudah maksimal di keranjang");
  };

  return (
    <section className="section katalog-bg" id="produk" aria-labelledby="produk-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="produk-title">Daftar produk</h2>
          <p>Daging untuk Meugang, masakan untuk kenduri, dan kue tradisional. Harga per satuan, belum termasuk ongkir.</p>
        </div>

        <div className="toolbar">
          <div className="search">
            <label className="sr-only" htmlFor="q">Cari produk</label>
            <Icon name="search" />
            <input className="input" id="q" type="search" placeholder="Cari daging, timphan, kuah beulangong…" autoComplete="off"
              maxLength={60} value={filter.q} onChange={e => setFilter({ ...filter, q: e.target.value })} />
          </div>
          <div className="sort">
            <label htmlFor="sort">Urutkan</label>
            <select className="select" id="sort" value={urutan} onChange={e => setUrutan(e.target.value as Urutan)}>
              <option value="default">Paling sesuai</option>
              <option value="murah">Harga termurah</option>
              <option value="mahal">Harga termahal</option>
              <option value="nama">Nama A–Z</option>
              <option value="sisa">Sisa kuota terbanyak</option>
            </select>
          </div>
          <button className="btn btn-outline filter-toggle" type="button" onClick={() => setSheet(true)} aria-controls="filter-panel" aria-expanded={sheet}>
            <Icon name="sliders" />Filter <span className="count-badge" data-empty={aktif === 0}>{aktif}</span>
          </button>
        </div>

        <div className="chips" role="group" aria-label="Kategori">
          {CHIP.map(k => (
            <button key={k} className="chip" type="button" aria-pressed={filter.kategori === k} onClick={() => setFilter({ ...filter, kategori: k })}>
              {k === "semua" ? "Semua" : KATEGORI[k]}
            </button>
          ))}
        </div>

        <div className="katalog-layout">
          <FilterPanel filter={filter} setFilter={setFilter} aktif={aktif} cocok={hasil.length} perMomen={hitungPerMomen(produk)}
            terbuka={sheet} tutup={() => setSheet(false)} />
          <div>
            {status === "galat" ? (
              <div className="empty" role="alert">
                <h3>Daftar produk gagal dimuat</h3>
                <p>{galat}</p>
                <button className="btn btn-primary" type="button" onClick={() => void muatUlang()}>Coba lagi</button>
              </div>
            ) : status === "memuat" ? (
              <div className="grid" aria-busy="true" aria-label="Memuat produk">
                {Array.from({ length: 6 }, (_, i) => <div key={i} className="card skeleton" />)}
              </div>
            ) : (<>
              <p className="results-meta" aria-live="polite">
                {hasil.length === produk.length ? "Menampilkan semua " + produk.length + " produk" : "Menampilkan " + hasil.length + " dari " + produk.length + " produk"}
              </p>
              {hasil.length ? (
                <div className="grid">
                  {hasil.map(p => (
                    <ProductCard key={p.id} produk={p} noWhatsApp={pengaturan.noWhatsApp} poBuka={poBuka}
                      diKeranjang={keranjang.items.find(c => c.produkId === p.id)?.jumlah ?? 0} onTambah={tambah} />
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <h3>Tidak ada produk yang cocok</h3>
                  <p>Coba kata lain, pilih kategori Semua, atau reset filter.</p>
                  <button className="btn btn-outline" type="button" onClick={() => setFilter(FILTER_AWAL)}>Reset semua filter</button>
                </div>
              )}
            </>)}
          </div>
        </div>
      </div>
      <div className={"backdrop" + (sheet ? " show" : "")} onClick={() => setSheet(false)} aria-hidden="true" />
    </section>
  );
}
