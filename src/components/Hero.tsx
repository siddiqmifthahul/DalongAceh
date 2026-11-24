import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Gelombang } from "./Gelombang";
import { useData } from "../state/data";
import { sisaWaktu, tanggalPanjang } from "../lib/format";

export function Hero() {
  const { pengaturan } = useData();
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setSekarang(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const w = sisaWaktu(pengaturan.poTutup, sekarang);

  return (
    <section className="d-hero on-dark" aria-labelledby="hero-title">
      <div className="d-hero-motif" aria-hidden="true" />
      <div className="wrap d-hero-inner">
        <div className="d-hero-teks">
          <p className="d-eyebrow rise d1">Pre-order {pengaturan.momenLabel}</p>
          <h1 id="hero-title" className="rise d2">Daging Meugang dipotong subuh, siap diambil pagi harinya.</h1>
          <p className="d-hero-lead rise d3">
            Daging, masakan kenduri, dan kue tradisional dari {pengaturan.namaUsaha}. Pilih jam ambil,
            kirim pesanan lewat WhatsApp, lalu datang tanpa antre.
          </p>
          <p className="d-countdown rise d4">
            {w.selesai ? <span>PO sudah ditutup</span> : (<>
              <span className="d-countdown-label">PO ditutup dalam</span>{" "}
              <strong>{w.hari}</strong> hari <strong>{w.jam}</strong> jam <strong>{w.menit}</strong> menit
            </>)}
            <span className="d-countdown-tgl">{tanggalPanjang(pengaturan.poTutup)} WIB</span>
          </p>
          <div className="d-hero-aksi rise d5">
            <a className="d-btn d-btn-emas" href="#produk">Lihat Menu <Icon name="panah" /></a>
            <a className="d-btn d-btn-garis" href="#kalkulator">Hitung Porsi <Icon name="panah" /></a>
          </div>
        </div>
        <figure className="d-hero-art rise d3">
          <span className="d-hero-busur" aria-hidden="true" />
          <span className="d-hero-ketupat" aria-hidden="true" />
          <div className="d-hero-foto">
            <img src="/img/beulangong.jpg" alt="Kuah beulangong dimasak dalam kuali besar untuk kenduri Aceh"
              width={960} height={906} style={{ objectPosition: "50% 45%" }} fetchPriority="high" />
          </div>
          <figcaption className="d-hero-kredit">Foto: Si Gam, CC BY-SA 4.0</figcaption>
        </figure>
      </div>
      <Gelombang posisi="bawah" />
    </section>
  );
}
