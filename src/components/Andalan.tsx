import { Icon } from "./Icon";
import { fotoProduk } from "./ProductCard";
import { rp } from "../lib/format";
import { sisa } from "../lib/katalog";
import type { Produk } from "../lib/types";
import { useData } from "../state/data";
import { useKeranjang } from "../state/keranjang";
import { useToast } from "../state/toast";

/** Posisi 6 hidangan mengelilingi elips (persen dari kotak), searah jarum jam dari atas. */
const POSISI = [
  { x: 50, y: 7 }, { x: 85, y: 25 }, { x: 85, y: 73 },
  { x: 50, y: 93 }, { x: 15, y: 73 }, { x: 15, y: 25 }
];

export function Andalan() {
  const { produk, pengaturan, status } = useData();
  const keranjang = useKeranjang();
  const toast = useToast();
  const daftar = [...produk].filter(p => p.aktif).sort((a, b) => a.urutan - b.urutan).slice(0, 6);
  const poBuka = Date.now() < Date.parse(pengaturan.poTutup);

  const tambah = (p: Produk) => {
    const n = keranjang.tambah(p, 1);
    toast(n > 0 ? p.nama + " masuk keranjang" : "Kuota " + p.nama + " sudah maksimal di keranjang");
  };

  if (status !== "siap" || daftar.length === 0) return <section id="andalan" className="d-andalan d-andalan-kosong" aria-hidden="true" />;

  return (
    <section id="andalan" className="d-andalan" aria-labelledby="andalan-title">
      <div className="wrap">
        <div className="d-lingkar">
          <svg className="d-lingkar-garis" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <ellipse cx="500" cy="350" rx="420" ry="300" />
          </svg>
          <span className="d-ketupat d-ketupat-kiri" aria-hidden="true" />
          <span className="d-ketupat d-ketupat-kanan" aria-hidden="true" />
          <h2 id="andalan-title" className="d-andalan-judul">
            <span>Hidangan</span> Andalan <span>Meugang &amp; Kenduri</span>
          </h2>
          <ul className="d-andalan-daftar">
            {daftar.map((p, i) => {
              const habis = sisa(p) <= 0;
              return (
                <li key={p.id} className="d-andalan-item" style={{ ["--x" as string]: POSISI[i].x + "%", ["--y" as string]: POSISI[i].y + "%" }}>
                  <div className="d-andalan-foto">
                    <img src={fotoProduk(p)} alt={"Foto " + p.nama} width={160} height={160} loading="lazy" decoding="async" style={{ objectPosition: p.fokus }} />
                    {habis
                      ? <span className="d-andalan-habis">Habis</span>
                      : (
                        <button className="d-andalan-troli" type="button" disabled={!poBuka}
                          aria-label={"Tambah " + p.nama + " ke keranjang"} onClick={() => tambah(p)}>
                          <Icon name="troli" />
                        </button>
                      )}
                  </div>
                  <p className="d-andalan-nama">{p.nama}</p>
                  <p className="d-andalan-harga">{rp(p.harga)}<span>/{p.satuan}</span></p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
