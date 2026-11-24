import { useState } from "react";
import { rp } from "../../lib/format";
import { formatWA, waUrl } from "../../lib/whatsapp";
import { STATUS, type StatusPesanan } from "../../lib/types";
import { useToast } from "../../state/toast";
import { useAdmin } from "./useAdmin";

const waktuFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export function PesananAdmin() {
  const { sumber, pesanan, memuat, galat, segarkan } = useAdmin();
  const toast = useToast();
  const [saring, setSaring] = useState<StatusPesanan | "semua">("semua");
  const daftar = saring === "semua" ? pesanan : pesanan.filter(o => o.status === saring);

  const ubah = async (kode: string, status: StatusPesanan) => {
    try {
      await sumber.ubahStatus(kode, status);
      toast("Status " + kode + " diubah ke " + STATUS[status].label);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Status gagal diubah.");
    }
    await segarkan();
  };

  return (<>
    <div className="panel-head">
      <div><h1>Pesanan</h1><p>Ubah status setelah DP atau pelunasan diterima. Status Dibatalkan mengembalikan kuota.</p></div>
      <div className="sort">
        <label htmlFor="saring-status">Tampilkan</label>
        <select className="select" id="saring-status" value={saring} onChange={e => setSaring(e.target.value as StatusPesanan | "semua")}>
          <option value="semua">Semua status</option>
          {(Object.keys(STATUS) as StatusPesanan[]).map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
        </select>
      </div>
    </div>
    {galat && <p className="form-error-box" role="alert">{galat}</p>}
    {!memuat && !daftar.length ? (
      <div className="empty"><h3>Belum ada pesanan</h3><p>Pesanan dari keranjang pembeli akan muncul di sini.</p></div>
    ) : (
      <div className="rows" style={{ ["--cols" as string]: "1fr 1.4fr 2fr 1fr 1.2fr" }}>
        <div className="row-head"><span>Kode</span><span>Pemesan</span><span>Isi pesanan</span><span>Total</span><span>Status</span></div>
        {daftar.map(o => {
          const wa = waUrl(o.noHp, "Assalamu'alaikum " + o.nama + ", pesanan " + o.kode + " sudah kami terima.");
          return (
            <div className="row" key={o.kode}>
              <div><span className="m-label">Kode</span><strong>{o.kode}</strong><br /><span className="hint">{waktuFmt.format(new Date(o.waktu))}</span></div>
              <div><span className="m-label">Pemesan</span>{o.nama}<br />
                {wa ? <a href={wa} target="_blank" rel="noopener noreferrer">{formatWA(o.noHp)}</a> : o.noHp}<br />
                <span className="hint">{o.metode === "antar" ? "Antar " : "Ambil "}{o.slot}</span>
                {o.alamat && <><br /><span className="hint">{o.alamat}</span></>}
                {o.catatan && <><br /><span className="hint">Catatan: {o.catatan}</span></>}
              </div>
              <div><span className="m-label">Isi pesanan</span>
                <ul className="order-items">{o.items.map((i, n) => <li key={n}>{i.nama} × {i.jumlah} {i.satuan}</li>)}</ul></div>
              <div><span className="m-label">Total</span>{rp(o.total)}</div>
              <div>
                <label className="sr-only" htmlFor={"st-" + o.kode}>Status pesanan {o.kode}</label>
                <select className="select status-select" id={"st-" + o.kode} value={o.status} onChange={e => void ubah(o.kode, e.target.value as StatusPesanan)}>
                  {(Object.keys(STATUS) as StatusPesanan[]).map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </>);
}
