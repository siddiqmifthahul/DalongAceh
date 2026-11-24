import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { rp } from "../lib/format";
import { kodeValid, rapikanKode } from "../lib/kode";
import { STATUS, type RingkasanPesanan } from "../lib/types";
import { useData } from "../state/data";
import { useMuncul } from "./useMuncul";

function CekPesanan() {
  const { sumber } = useData();
  const [kode, setKode] = useState("");
  const [hp4, setHp4] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<RingkasanPesanan | null>(null);
  const [memuat, setMemuat] = useState(false);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setHasil(null);
    const k = rapikanKode(kode);
    if (!kodeValid(k)) { setGalat("Format kode: MK- diikuti 8 huruf/angka, misalnya MK-7Q4XK2PD."); return; }
    if (!/^\d{4}$/.test(hp4)) { setGalat("Isi 4 angka terakhir nomor WhatsApp yang dipakai saat memesan."); return; }
    setMemuat(true);
    try {
      const r = await sumber.cekPesanan(k, hp4);
      if (!r) setGalat("Pesanan tidak ditemukan. Periksa lagi kode dan 4 angka terakhir nomor WhatsApp Anda.");
      else { setGalat(null); setHasil(r); }
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Pesanan gagal dicek.");
    } finally { setMemuat(false); }
  };

  return (
    <div className="cek" id="cek-pesanan">
      <div>
        <h3>Cek pesanan</h3>
        <p>Masukkan kode yang ada di pesan WhatsApp Anda dan 4 angka terakhir nomor WhatsApp yang dipakai memesan.</p>
      </div>
      <div>
        <form className="cek-form" onSubmit={kirim} noValidate>
          <div className="form-field">
            <label htmlFor="cek-kode">Kode pesanan</label>
            <input className="input kode-input" id="cek-kode" placeholder="MK-7Q4XK2PD" maxLength={14} autoComplete="off"
              value={kode} onChange={e => setKode(e.target.value)} aria-invalid={Boolean(galat) || undefined} aria-describedby="cek-error" />
          </div>
          <div className="form-field">
            <label htmlFor="cek-hp">4 angka terakhir no. WA</label>
            <input className="input" id="cek-hp" inputMode="numeric" placeholder="7890" maxLength={4} autoComplete="off"
              value={hp4} onChange={e => setHp4(e.target.value.replace(/\D/g, ""))} aria-describedby="cek-error" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={memuat}>{memuat ? "Mengecek…" : "Cek"}</button>
        </form>
        {galat && <p className="error" id="cek-error" role="alert"><Icon name="alert" /><span>{galat}</span></p>}
        {hasil && (
          <div className="cek-result" aria-live="polite">
            <p><strong>{hasil.kode}</strong> <span className={"pill " + STATUS[hasil.status].nada}>{STATUS[hasil.status].label}</span></p>
            <ul>{hasil.items.map((i, n) => <li key={n}>{i.nama} × {i.jumlah} {i.satuan}</li>)}</ul>
            <p>{hasil.metode === "antar" ? "Antar: " : "Ambil: "}{hasil.slot}</p>
            <p><strong>Total {rp(hasil.total)}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

export function CaraPesan() {
  const { pengaturan } = useData();
  const muncul = useMuncul<HTMLOListElement>(0.2);
  return (
    <section className="section" id="cara-pesan" aria-labelledby="cara-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="cara-title">Cara pesan</h2>
          <p>Mau cepat? Ketuk tombol WhatsApp di produk mana saja. Mau pasti kebagian kuota? Pesan lewat keranjang.</p>
        </div>
        <ol className="steps" ref={muncul}>
          <li className="step"><span className="step-num" aria-hidden="true">1</span><h3>Pilih produk dan jumlahnya</h3><p>Sisa kuota terlihat di setiap produk, jadi Anda tahu masih kebagian atau tidak.</p></li>
          <li className="step"><span className="step-num" aria-hidden="true">2</span><h3>Pilih jam ambil</h3><p>Datang sesuai jam yang dipilih. Pesanan sudah ditimbang dan dibungkus.</p></li>
          <li className="step"><span className="step-num" aria-hidden="true">3</span><h3>Kirim lewat WhatsApp, lalu bayar DP</h3><p>Pesan sudah tersusun rapi dengan kode pesanan. {pengaturan.namaUsaha} akan membalas dengan info DP.</p></li>
        </ol>
        <CekPesanan />
      </div>
    </section>
  );
}
