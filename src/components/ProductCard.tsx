import { Icon, type NamaIkon } from "./Icon";
import { rp } from "../lib/format";
import { persenSisa, sisa, statusKuota } from "../lib/katalog";
import { pesanCepat, waUrl } from "../lib/whatsapp";
import { KATEGORI, type Kategori, type Produk } from "../lib/types";

const IKON_KATEGORI: Record<Kategori, NamaIkon> = { daging: "steak", masakan: "kuali", kue: "daun" };

export function fotoProduk(p: Pick<Produk, "foto" | "nama">): string {
  return p.foto ?? "/img/hero.jpg";
}

interface Props {
  produk: Produk;
  noWhatsApp: string;
  poBuka: boolean;
  diKeranjang?: number;
  onTambah?: (p: Produk) => void;
  pratinjau?: boolean;
}

export function ProductCard({ produk: p, noWhatsApp, poBuka, diKeranjang = 0, onTambah, pratinjau = false }: Props) {
  const s = sisa(p);
  const st = statusKuota(p);
  const habis = st === "habis";
  const penuh = diKeranjang >= s;
  const wa = waUrl(noWhatsApp, pesanCepat(p, habis));

  return (
    <article className="card" data-kat={p.kategori}>
      <div className="card-media">
        <img src={fotoProduk(p)} alt={"Foto " + p.nama} width={800} height={600} loading="lazy" decoding="async"
          style={{ objectPosition: p.fokus }} />
        <span className="tint" />
        <span className="card-tag">{KATEGORI[p.kategori]}</span>
        {habis ? <span className="card-flag out">Habis</span> : st === "hampir" ? <span className="card-flag low">Hampir habis</span> : null}
      </div>
      <div className="card-body">
        <div className="card-divider" aria-hidden="true"><Icon name={IKON_KATEGORI[p.kategori]} /></div>
        <h3 className="card-title">{p.nama || "Nama produk"}</h3>
        {p.ciri.length > 0 && (
          <ul className="card-ciri" aria-label="Ciri khas">{p.ciri.slice(0, 3).map(c => <li key={c}>{c}</li>)}</ul>
        )}
        <p className="card-desc">{p.deskripsi || "Deskripsi singkat produk."}</p>
        <div className="price"><strong>{rp(p.harga || 0)}</strong><span>/{p.satuan}</span></div>
        <div className={"quota" + (habis ? " out" : st === "hampir" ? " low" : "")}>
          <div className="bar" role="presentation"><span style={{ width: persenSisa(p) + "%" }} /></div>
          <p>{habis ? "Kuota momen ini sudah habis" : "Sisa " + s + " " + p.satuan + " dari " + p.kuota}</p>
        </div>
        <div className="card-actions">
          <button className="btn btn-line" type="button" disabled={pratinjau || habis || penuh || !poBuka}
            aria-label={habis ? p.nama + " habis" : "Tambah " + p.nama + " ke keranjang"}
            onClick={() => onTambah?.(p)}>
            <Icon name={habis ? "x" : "plus"} />{habis ? "Habis" : penuh ? "Maksimal" : "Keranjang"}
          </button>
          {pratinjau || !wa ? (
            <span className="btn btn-wa" aria-disabled="true"><Icon name="wa" />Pesan WA</span>
          ) : (
            <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"
              aria-label={(habis ? "Tanya ketersediaan " : "Pesan ") + p.nama + " lewat WhatsApp"}>
              <Icon name="wa" />{habis ? "Tanya stok" : "Pesan WA"}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
