import { rp } from "../../lib/format";
import { KATEGORI } from "../../lib/types";
import { fotoProduk } from "../../components/ProductCard";
import { useData } from "../../state/data";
import { useAdmin } from "./useAdmin";

/** Rekap produksi: total yang harus disiapkan, dihitung dari pesanan yang tidak dibatalkan. */
export function Rekap() {
  const { pengaturan } = useData();
  const { produk, pesanan } = useAdmin();
  const total = new Map<string, number>();
  for (const o of pesanan) {
    if (o.status === "batal") continue;
    for (const i of o.items) if (i.produkId) total.set(i.produkId, (total.get(i.produkId) ?? 0) + i.jumlah);
  }
  const baris = produk.map(p => ({ p, jumlah: total.get(p.id) ?? 0 })).filter(b => b.jumlah > 0);
  const nilai = baris.reduce((t, b) => t + b.jumlah * b.p.harga, 0);

  return (<>
    <div className="panel-head"><div><h1>Rekap produksi</h1><p>Total yang harus disiapkan untuk {pengaturan.momenLabel}, dari pesanan yang tidak dibatalkan.</p></div>
      <button className="btn btn-outline" type="button" onClick={() => window.print()}>Cetak rekap</button></div>
    {baris.length ? (<>
      <div className="rows" style={{ ["--cols" as string]: "minmax(200px,2fr) 1fr 1.4fr 1fr" }}>
        <div className="row-head"><span>Produk</span><span>Harus disiapkan</span><span>Terpakai dari kuota</span><span>Nilai</span></div>
        {baris.map(({ p, jumlah }) => {
          const persen = Math.min(100, Math.round(jumlah / Math.max(1, p.kuota) * 100));
          return (
            <div className="row" key={p.id}>
              <div className="prod-cell"><img src={fotoProduk(p)} alt="" width={60} height={45} style={{ objectPosition: p.fokus }} />
                <div><strong>{p.nama}</strong><span>{KATEGORI[p.kategori]}</span></div></div>
              <div><span className="m-label">Harus disiapkan</span><strong>{jumlah} {p.satuan}</strong></div>
              <div><span className="m-label">Terpakai dari kuota</span>
                <div className="rekap-bar" role="presentation"><span style={{ width: persen + "%" }} /></div>
                <span className="hint">{persen}% dari {p.kuota} {p.satuan}</span></div>
              <div><span className="m-label">Nilai</span>{rp(jumlah * p.harga)}</div>
            </div>
          );
        })}
      </div>
      <div className="rekap-total"><span>Total nilai pesanan</span><strong>{rp(nilai)}</strong></div>
    </>) : <div className="empty"><h3>Belum ada yang perlu disiapkan</h3><p>Rekap muncul setelah ada pesanan masuk.</p></div>}
  </>);
}
