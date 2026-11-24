import { useState } from "react";
import { Icon } from "./Icon";
import { rp } from "../lib/format";
import { sisa } from "../lib/katalog";
import { ATURAN_PORSI, batasiTamu, hitungPorsi, TAMU_MAKS, TAMU_MIN } from "../lib/kalkulator";
import { useData } from "../state/data";
import { useKeranjang } from "../state/keranjang";
import { useToast } from "../state/toast";

/** Banner berbingkai emas (gaya "Online Reservation" di referensi) berisi kalkulator porsi kenduri. */
export function Kalkulator() {
  const { produk, pengaturan } = useData();
  const keranjang = useKeranjang();
  const toast = useToast();
  const masakan = produk.filter(p => p.kategori === "masakan");
  const kue = produk.filter(p => p.kategori === "kue");
  const daging = produk.filter(p => p.kategori === "daging");

  const [tamu, setTamu] = useState(150);
  const [teksTamu, setTeksTamu] = useState("150");
  const [idMasakan, setIdMasakan] = useState<string>("");
  const [idKue, setIdKue] = useState<string>("");
  const [idDaging, setIdDaging] = useState<string>("");

  const pilihMasakan = idMasakan === "-" ? null : idMasakan || masakan[0]?.id || null;
  const pilihKue = idKue === "-" ? null : idKue || kue[0]?.id || null;
  const pilihDaging = idDaging === "" || idDaging === "-" ? null : idDaging;

  const ubahTamu = (n: number) => { const v = batasiTamu(n); setTamu(v); setTeksTamu(String(v)); };
  const rekomendasi = hitungPorsi(tamu, { masakan: pilihMasakan, kue: pilihKue, daging: pilihDaging })
    .map(r => ({ ...r, p: produk.find(x => x.id === r.produkId) })).filter(r => r.p);
  const total = rekomendasi.reduce((t, r) => t + r.p!.harga * r.jumlah, 0);
  const poBuka = Date.now() < Date.parse(pengaturan.poTutup);

  const masukkan = () => {
    let lengkap = true;
    for (const r of rekomendasi) if (keranjang.tambah(r.p!, r.jumlah) < r.jumlah) lengkap = false;
    toast(lengkap ? "Pesanan kenduri masuk keranjang" : "Masuk keranjang, sebagian dibatasi kuota");
    keranjang.buka();
  };

  return (
    <section className="d-banner-wrap" id="kalkulator" aria-labelledby="kalk-title">
      <div className="wrap">
        <div className="d-banner">
          <div className="d-banner-foto">
            <img src="/img/reuboh.jpg" alt="Hidangan khas Aceh tersaji untuk kenduri" width={960} height={1280} loading="lazy" style={{ objectPosition: "45% 40%" }} />
          </div>
          <div className="d-banner-isi">
            <h2 id="kalk-title">Hitung Porsi Kenduri</h2>
            <p className="d-banner-lead">Masukkan jumlah tamu, kami hitungkan berapa paket masakan, kue, dan daging yang perlu dipesan.</p>

            <div className="d-banner-form">
              <div className="d-field">
                <label htmlFor="tamu">Jumlah tamu</label>
                <div className="d-stepper">
                  <button type="button" onClick={() => ubahTamu(tamu - 10)} aria-label="Kurangi 10 tamu"><Icon name="minus" /></button>
                  <input id="tamu" type="number" inputMode="numeric" min={TAMU_MIN} max={TAMU_MAKS} step={10} value={teksTamu}
                    onChange={e => setTeksTamu(e.target.value)} onBlur={() => ubahTamu(Number(teksTamu))}
                    onKeyDown={e => e.key === "Enter" && ubahTamu(Number(teksTamu))} />
                  <button type="button" onClick={() => ubahTamu(tamu + 10)} aria-label="Tambah 10 tamu"><Icon name="plus" /></button>
                </div>
              </div>
              <div className="d-field">
                <label htmlFor="k-masak">Masakan kenduri</label>
                <select className="d-select" id="k-masak" value={pilihMasakan ?? "-"} onChange={e => setIdMasakan(e.target.value)}>
                  {masakan.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  <option value="-">Tidak pesan masakan</option>
                </select>
              </div>
              <div className="d-field">
                <label htmlFor="k-kue">Kue suguhan</label>
                <select className="d-select" id="k-kue" value={pilihKue ?? "-"} onChange={e => setIdKue(e.target.value)}>
                  {kue.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  <option value="-">Tidak pesan kue</option>
                </select>
              </div>
              <div className="d-field">
                <label htmlFor="k-daging">Daging mentah</label>
                <select className="d-select" id="k-daging" value={pilihDaging ?? "-"} onChange={e => setIdDaging(e.target.value)}>
                  <option value="-">Tidak pesan daging</option>
                  {daging.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
            </div>

            <div className="d-ringkasan" aria-live="polite">
              {rekomendasi.length ? rekomendasi.map(r => {
                const s = sisa(r.p!);
                return (
                  <div className="d-ringkasan-baris" key={r.produkId}>
                    <span>{r.p!.nama}</span>
                    <strong>{r.jumlah} {r.p!.satuan}</strong>
                    {r.jumlah > s && <em>{s === 0 ? "Kuota habis, tanyakan alternatif lewat WhatsApp." : "Kuota tersisa " + s + " " + r.p!.satuan + "."}</em>}
                  </div>
                );
              }) : <p className="hint">Pilih minimal satu jenis pesanan.</p>}
              <div className="d-ringkasan-total"><span>Perkiraan total untuk {tamu} tamu</span><strong>{rp(total)}</strong></div>
            </div>

            <button className="d-btn-besar" type="button" disabled={!rekomendasi.length || !poBuka} onClick={masukkan}>
              Masukkan ke Keranjang <Icon name="panah" />
            </button>
            <p className="d-banner-catatan">
              Perkiraan: 1 paket masakan untuk {ATURAN_PORSI.tamuPerPaketMasakan} tamu, {ATURAN_PORSI.kuePerTamu} kue per tamu,
              1 kg daging untuk {ATURAN_PORSI.orangPerKgDaging} orang.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
