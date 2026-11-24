import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Icon } from "./Icon";
import { FilterPanel } from "./FilterPanel";
import { ProductCard, fotoProduk } from "./ProductCard";
import { FILTER_AWAL, hitungPerMomen, jumlahFilterAktif, saringProduk, type Filter, type Urutan } from "../lib/katalog";
import { KATEGORI, type Kategori, type Produk } from "../lib/types";
import { useData } from "../state/data";
import { useKeranjang } from "../state/keranjang";
import { useToast } from "../state/toast";
import { useMuncul } from "./useMuncul";

type PilihanKategori = Kategori | "semua";
const URUTAN_KATEGORI: PilihanKategori[] = ["semua", "daging", "masakan", "kue"];
const JUDUL: Record<PilihanKategori, string> = { semua: "Semua Menu", ...KATEGORI };
const TAGLINE: Record<PilihanKategori, string> = {
  semua: "Dari dapur kami untuk Meugang dan kenduri Anda.",
  daging: "Dipotong subuh, siap dimasak di hari Meugang.",
  masakan: "Satu kuali untuk seluruh tamu kenduri.",
  kue: "Suguhan manis untuk setiap tamu yang datang."
};

export function Katalog() {
  const { produk, pengaturan, status, galat, muatUlang } = useData();
  const keranjang = useKeranjang();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>(FILTER_AWAL);
  const [urutan, setUrutan] = useState<Urutan>("default");
  const [sheet, setSheet] = useState(false);
  const q = useDeferredValue(filter.q);
  const muncul = useMuncul<HTMLDivElement>(0.05);

  const hasil = useMemo(() => saringProduk(produk, { ...filter, q }, urutan), [produk, filter, q, urutan]);
  const aktif = jumlahFilterAktif(filter);
  const poBuka = Date.now() < Date.parse(pengaturan.poTutup);
  const urut = useMemo(() => [...produk].sort((a, b) => a.urutan - b.urutan), [produk]);
  const thumb = (k: PilihanKategori) => (k === "semua" ? urut[0] : urut.find(p => p.kategori === k));
  const jumlahKat = (k: PilihanKategori) => produk.filter(p => p.aktif && (k === "semua" || p.kategori === k)).length;

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
    <section className="d-menu" id="produk" aria-labelledby="produk-title">
      <div className="wrap d-menu-grid" ref={muncul}>
        <aside className="d-menu-kiri">
          <p className="d-menu-eyebrow">Menu Kami</p>
          <div className="d-pil-daftar" role="group" aria-label="Kategori">
            {URUTAN_KATEGORI.map(k => {
              const t = thumb(k);
              return (
                <button key={k} type="button" className="d-pil" aria-pressed={filter.kategori === k}
                  onClick={() => setFilter({ ...filter, kategori: k })}>
                  <span className="d-pil-foto">{t && <img src={fotoProduk(t)} alt="" width={64} height={64} loading="lazy" style={{ objectPosition: t.fokus }} />}</span>
                  <span className="d-pil-label">{JUDUL[k]}<small>{jumlahKat(k)} produk</small></span>
                  <Icon name="chevron" />
                </button>
              );
            })}
          </div>
          <FilterPanel filter={filter} setFilter={setFilter} aktif={aktif} cocok={hasil.length} perMomen={hitungPerMomen(produk)}
            terbuka={sheet} tutup={() => setSheet(false)} />
        </aside>

        <div className="d-menu-kanan">
          <div className="d-menu-judul">
            <h2 id="produk-title">{JUDUL[filter.kategori]}</h2>
            <p className="d-tagline">{TAGLINE[filter.kategori]}</p>
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

          {status === "galat" ? (
            <div className="empty" role="alert">
              <h3>Daftar produk gagal dimuat</h3>
              <p>{galat}</p>
              <button className="btn btn-primary" type="button" onClick={() => void muatUlang()}>Coba lagi</button>
            </div>
          ) : status === "memuat" ? (
            <div className="d-card-grid" aria-busy="true" aria-label="Memuat produk">
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="d-card skeleton" />)}
            </div>
          ) : (<>
            <p className="results-meta" aria-live="polite">
              {hasil.length === produk.length ? "Menampilkan semua " + produk.length + " produk" : "Menampilkan " + hasil.length + " dari " + produk.length + " produk"}
            </p>
            {hasil.length ? (
              <div className="d-card-grid">
                {hasil.map(p => (
                  <ProductCard key={p.id} produk={p} noWhatsApp={pengaturan.noWhatsApp} poBuka={poBuka}
                    diKeranjang={keranjang.items.find(c => c.produkId === p.id)?.jumlah ?? 0} onTambah={tambah} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>Tidak ada produk yang cocok</h3>
                <p>Coba kata lain, pilih kategori Semua Menu, atau reset filter.</p>
                <button className="btn btn-outline" type="button" onClick={() => setFilter(FILTER_AWAL)}>Reset semua filter</button>
              </div>
            )}
          </>)}
        </div>
      </div>
      <div className={"backdrop" + (sheet ? " show" : "")} onClick={() => setSheet(false)} aria-hidden="true" />
    </section>
  );
}
