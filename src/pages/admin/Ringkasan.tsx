import { Link } from "react-router-dom";
import { rp, tanggalPanjang } from "../../lib/format";
import { sisa, statusKuota } from "../../lib/katalog";
import { KATEGORI } from "../../lib/types";
import { fotoProduk } from "../../components/ProductCard";
import { useData } from "../../state/data";
import { useAdmin } from "./useAdmin";

export function Ringkasan() {
  const { pengaturan } = useData();
  const { produk, pesanan, memuat, galat } = useAdmin();
  const aktifPesanan = pesanan.filter(o => o.status !== "batal");
  const baru = pesanan.filter(o => o.status === "baru").length;
  const perhatian = produk.filter(p => p.aktif && statusKuota(p) !== "ada").sort((a, b) => sisa(a) - sisa(b));
  const omzet = aktifPesanan.reduce((t, o) => t + o.total, 0);

  return (<>
    <div className="panel-head"><div>
      <h1>Ringkasan {pengaturan.momenLabel}</h1>
      <p>PO ditutup {tanggalPanjang(pengaturan.poTutup)} WIB</p>
    </div></div>
    {galat && <p className="form-error-box" role="alert">{galat}</p>}
    <div className="stats" aria-busy={memuat}>
      <div className="stat"><span className="stat-value">{aktifPesanan.length}</span><span className="stat-label">Pesanan aktif</span></div>
      <div className={"stat" + (baru ? " alert" : "")}><span className="stat-value">{baru}</span><span className="stat-label">Belum dikonfirmasi</span></div>
      <div className={"stat" + (perhatian.length ? " alert" : "")}><span className="stat-value">{perhatian.length}</span><span className="stat-label">Produk hampir/sudah habis</span></div>
      <div className="stat"><span className="stat-value">{rp(omzet)}</span><span className="stat-label">Nilai pesanan aktif</span></div>
    </div>
    <h2 className="sub-title">Perlu perhatian</h2>
    {perhatian.length ? (
      <div className="rows" style={{ ["--cols" as string]: "2fr 1fr 1fr" }}>
        <div className="row-head"><span>Produk</span><span>Sisa kuota</span><span>Status</span></div>
        {perhatian.map(p => (
          <div className="row" key={p.id}>
            <div className="prod-cell"><img src={fotoProduk(p)} alt="" width={60} height={45} style={{ objectPosition: p.fokus }} />
              <div><strong>{p.nama}</strong><span>{KATEGORI[p.kategori]}</span></div></div>
            <div><span className="m-label">Sisa kuota</span>{sisa(p)} dari {p.kuota} {p.satuan}</div>
            <div>{statusKuota(p) === "habis" ? <span className="pill danger">Habis</span> : <span className="pill warn">Hampir habis</span>}</div>
          </div>
        ))}
      </div>
    ) : <p className="hint">Semua produk masih punya kuota yang cukup. <Link to="/admin/produk">Kelola produk</Link></p>}
  </>);
}
