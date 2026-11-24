import { useState } from "react";
import { Icon } from "./Icon";
import { rp } from "../lib/format";
import { sisa } from "../lib/katalog";
import { ATURAN_PORSI, batasiTamu, hitungPorsi, TAMU_MAKS, TAMU_MIN } from "../lib/kalkulator";
import { useData } from "../state/data";
import { useKeranjang } from "../state/keranjang";
import { useToast } from "../state/toast";

export function Kalkulator() {
  const { produk, pengaturan } = useData();
  const keranjang = useKeranjang();
  const toast = useToast();
  const masakan = produk.filter(p => p.kategori === "masakan");
  const kue = produk.filter(p => p.kategori === "kue");
  const daging = produk.filter(p => p.kategori === "daging");

  const [tamu, setTamu] = useState(150);
  const [teksTamu, setTeksTamu] = useState("150");
  const [pakaiMasakan, setPakaiMasakan] = useState(true);
  const [pakaiKue, setPakaiKue] = useState(true);
  const [pakaiDaging, setPakaiDaging] = useState(false);
  const [idMasakan, setIdMasakan] = useState<string>("");
  const [idKue, setIdKue] = useState<string>("");
  const [idDaging, setIdDaging] = useState<string>("");

  const pilihMasakan = idMasakan || masakan[0]?.id || null;
  const pilihKue = idKue || kue[0]?.id || null;
  const pilihDaging = idDaging || daging[0]?.id || null;

  const ubahTamu = (n: number) => { const v = batasiTamu(n); setTamu(v); setTeksTamu(String(v)); };
  const rekomendasi = hitungPorsi(tamu, {
    masakan: pakaiMasakan ? pilihMasakan : null,
    kue: pakaiKue ? pilihKue : null,
    daging: pakaiDaging ? pilihDaging : null
  }).map(r => ({ ...r, p: produk.find(x => x.id === r.produkId) })).filter(r => r.p);
  const total = rekomendasi.reduce((t, r) => t + r.p!.harga * r.jumlah, 0);
  const poBuka = Date.now() < Date.parse(pengaturan.poTutup);

  const masukkan = () => {
    let lengkap = true;
    for (const r of rekomendasi) if (keranjang.tambah(r.p!, r.jumlah) < r.jumlah) lengkap = false;
    toast(lengkap ? "Pesanan kenduri masuk keranjang" : "Masuk keranjang, sebagian dibatasi kuota");
    keranjang.buka();
  };

  return (
    <section className="section kalk on-green" id="kalkulator" aria-labelledby="kalk-title">
      <div className="wrap kalk-grid">
        <div>
          <div className="section-head">
            <h2 id="kalk-title">Hitung porsi untuk kenduri</h2>
            <p>Masukkan perkiraan jumlah tamu. Kami hitungkan berapa paket masakan, kue, dan daging yang perlu dipesan.</p>
          </div>
          <div className="kalk-controls">
            <label className="kalk-label" htmlFor="tamu">Jumlah tamu</label>
            <div className="stepper">
              <button className="btn btn-icon" type="button" onClick={() => ubahTamu(tamu - 10)} aria-label="Kurangi 10 tamu"><Icon name="minus" /></button>
              <input id="tamu" type="number" inputMode="numeric" min={TAMU_MIN} max={TAMU_MAKS} step={10} value={teksTamu}
                onChange={e => setTeksTamu(e.target.value)} onBlur={() => ubahTamu(Number(teksTamu))}
                onKeyDown={e => e.key === "Enter" && ubahTamu(Number(teksTamu))} />
              <button className="btn btn-icon" type="button" onClick={() => ubahTamu(tamu + 10)} aria-label="Tambah 10 tamu"><Icon name="plus" /></button>
              <span className="unit">orang</span>
            </div>
            <label className="sr-only" htmlFor="tamu-range">Geser jumlah tamu</label>
            <input className="range" id="tamu-range" type="range" min={TAMU_MIN} max={TAMU_MAKS} step={10} value={tamu}
              onChange={e => ubahTamu(Number(e.target.value))} />

            <fieldset>
              <legend>Yang mau dipesan</legend>
              {masakan.length > 0 && (
                <div className="kalk-choice">
                  <label className="opt"><input type="checkbox" checked={pakaiMasakan} onChange={e => setPakaiMasakan(e.target.checked)} />Masakan kenduri</label>
                  <label className="sr-only" htmlFor="k-masak">Pilih masakan</label>
                  <select className="select" id="k-masak" disabled={!pakaiMasakan} value={pilihMasakan ?? ""} onChange={e => setIdMasakan(e.target.value)}>
                    {masakan.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
              )}
              {kue.length > 0 && (
                <div className="kalk-choice">
                  <label className="opt"><input type="checkbox" checked={pakaiKue} onChange={e => setPakaiKue(e.target.checked)} />Kue untuk suguhan</label>
                  <label className="sr-only" htmlFor="k-kue">Pilih kue</label>
                  <select className="select" id="k-kue" disabled={!pakaiKue} value={pilihKue ?? ""} onChange={e => setIdKue(e.target.value)}>
                    {kue.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
              )}
              {daging.length > 0 && (
                <div className="kalk-choice">
                  <label className="opt"><input type="checkbox" checked={pakaiDaging} onChange={e => setPakaiDaging(e.target.checked)} />Daging mentah untuk dimasak sendiri</label>
                  <label className="sr-only" htmlFor="k-daging">Pilih daging</label>
                  <select className="select" id="k-daging" disabled={!pakaiDaging} value={pilihDaging ?? ""} onChange={e => setIdDaging(e.target.value)}>
                    {daging.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
              )}
            </fieldset>
            <p className="note">
              Perkiraan: 1 paket masakan untuk {ATURAN_PORSI.tamuPerPaketMasakan} tamu, {ATURAN_PORSI.kuePerTamu} kue per tamu,
              1 kg daging untuk {ATURAN_PORSI.orangPerKgDaging} orang.
            </p>
          </div>
        </div>

        <div className="talam" aria-live="polite">
          <h3>Untuk {tamu} tamu</h3>
          <p>Perkiraan pesanan yang dibutuhkan</p>
          {rekomendasi.length ? rekomendasi.map(r => {
            const s = sisa(r.p!);
            return (
              <div className="talam-row" key={r.produkId}>
                <span className="name">{r.p!.nama}</span>
                <span className="qty">{r.jumlah} {r.p!.satuan}</span>
                <span className="sub">{rp(r.p!.harga)} × {r.jumlah} = {rp(r.p!.harga * r.jumlah)}</span>
                {r.jumlah > s && (
                  <span className="warn">{s === 0 ? "Kuota habis, tanyakan alternatif lewat WhatsApp." : "Kuota tersisa " + s + " " + r.p!.satuan + ", sisanya tanyakan lewat WhatsApp."}</span>
                )}
              </div>
            );
          }) : <p className="hint">Pilih minimal satu jenis pesanan di sebelah kiri.</p>}
          <div className="talam-total"><span>Perkiraan total</span><strong>{rp(total)}</strong></div>
          <button className="btn btn-primary btn-block" type="button" disabled={!rekomendasi.length || !poBuka} onClick={masukkan}>
            <Icon name="bag" />Masukkan ke keranjang
          </button>
        </div>
      </div>
    </section>
  );
}
