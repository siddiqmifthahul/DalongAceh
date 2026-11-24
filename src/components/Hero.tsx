import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useData } from "../state/data";
import { sisaWaktu, tanggalPanjang } from "../lib/format";
import { persenSisa, sisa, statusKuota } from "../lib/katalog";

export function Hero() {
  const { pengaturan, produk } = useData();
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setSekarang(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const w = sisaWaktu(pengaturan.poTutup, sekarang);
  const unggulan = produk.find(p => p.kategori === "daging") ?? produk[0];

  return (
    <section className="hero on-dark" aria-labelledby="hero-title">
      <div className="hero-motif" aria-hidden="true" />
      <div className="wrap hero-inner">
        <div>
          <span className="moment-badge rise d1"><Icon name="calendar" />{pengaturan.momenLabel}</span>
          <h1 id="hero-title" className="rise d2">Daging Meugang dipotong subuh, siap diambil pagi harinya.</h1>
          <p className="hero-lead rise d3">
            Pesan daging, masakan kenduri, dan kue dari {pengaturan.namaUsaha} sebelum kuota habis. Pilih jam ambil,
            kirim pesanan lewat WhatsApp, lalu datang tanpa antre.
          </p>
          <div className="countdown rise d4">
            <p className="countdown-label">{w.selesai ? "Pre-order" : "PO ditutup dalam"}</p>
            <p className="countdown-value">
              {w.selesai ? <span className="num">PO sudah ditutup</span> : (<>
                <span className="num">{w.hari}</span><span className="unit">hari</span>
                <span className="num">{w.jam}</span><span className="unit">jam</span>
                <span className="num">{w.menit}</span><span className="unit">menit</span>
              </>)}
            </p>
            <p className="countdown-date">{tanggalPanjang(pengaturan.poTutup)} WIB</p>
          </div>
          <div className="hero-actions rise d5">
            <a className="btn btn-kunyit" href="#produk">Lihat daftar produk</a>
            <a className="btn btn-ghost-light" href="#kalkulator">Hitung porsi kenduri</a>
          </div>
        </div>
        <figure className="hero-figure rise d3">
          <div className="hero-photo">
            <img src="/img/hero.jpg" alt="Pedagang daging melayani pembeli di pasar Banda Aceh saat Meugang"
              width={1280} height={720} style={{ objectPosition: "58% 50%" }} fetchPriority="high" />
            <span className="tint" />
            <span className="hero-credit">Foto: Si Gam, CC BY-SA 4.0</span>
          </div>
          {unggulan && (
            <figcaption className="hero-stock">
              <p className="hero-stock-title">{unggulan.nama}</p>
              <div className={"quota" + (statusKuota(unggulan) === "hampir" ? " low" : "")}>
                <div className="bar" role="presentation"><span style={{ width: persenSisa(unggulan) + "%" }} /></div>
                <p>Sisa {sisa(unggulan)} {unggulan.satuan} dari {unggulan.kuota} {unggulan.satuan}</p>
              </div>
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
