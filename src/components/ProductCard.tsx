import { Icon } from "./Icon";
import { rp } from "../lib/format";
import { persenSisa, sisa, statusKuota } from "../lib/katalog";
import { pesanCepat, waUrl } from "../lib/whatsapp";
import { KATEGORI, type Produk } from "../lib/types";

export function fotoProduk(p: Pick<Produk, "foto" | "nama">): string {
  return p.foto ?? "/img/beulangong.jpg";
}

interface Props {
  produk: Produk;
  noWhatsApp: string;
  poBuka: boolean;
  diKeranjang?: number;
  onTambah?: (p: Produk) => void;
  pratinjau?: boolean;
}

/** Kartu menu gaya referensi: foto bulat, nama, harga, tombol pil Keranjang + Pesan WA. */
export function ProductCard({ produk: p, noWhatsApp, poBuka, diKeranjang = 0, onTambah, pratinjau = false }: Props) {
  const s = sisa(p);
  const st = statusKuota(p);
  const habis = st === "habis";
  const penuh = diKeranjang >= s;
  const wa = waUrl(noWhatsApp, pesanCepat(p, habis));

  return (
    <article className="d-card" data-kat={p.kategori}>
      {habis ? <span className="d-card-flag habis">Habis</span> : st === "hampir" ? <span className="d-card-flag hampir">Hampir habis</span> : null}
      <div className="d-card-foto">
        <img src={fotoProduk(p)} alt={"Foto " + p.nama} width={300} height={300} loading="lazy" decoding="async" style={{ objectPosition: p.fokus }} />
      </div>
      <p className="d-card-kat">{KATEGORI[p.kategori]}</p>
      <h3 className="d-card-nama">{p.nama || "Nama produk"}</h3>
      <p className="d-card-desk">{p.deskripsi || "Deskripsi singkat produk."}</p>
      <p className="d-card-harga"><strong>{rp(p.harga || 0)}</strong><span>/{p.satuan}</span></p>
      <div className={"quota" + (habis ? " out" : st === "hampir" ? " low" : "")}>
        <div className="bar" role="presentation"><span style={{ width: persenSisa(p) + "%" }} /></div>
        <p>{habis ? "Kuota momen ini habis" : "Sisa " + s + " " + p.satuan + " dari " + p.kuota}</p>
      </div>
      <div className="d-card-aksi">
        <button className="d-btn-kecil d-btn-keranjang" type="button" disabled={pratinjau || habis || penuh || !poBuka}
          aria-label={habis ? p.nama + " habis" : "Tambah " + p.nama + " ke keranjang"} onClick={() => onTambah?.(p)}>
          {habis ? "Habis" : penuh ? "Maksimal" : "Keranjang"}<Icon name="troli" />
        </button>
        {pratinjau || !wa ? (
          <span className="d-btn-kecil d-btn-wa" aria-disabled="true"><Icon name="wa" />Pesan WA</span>
        ) : (
          <a className="d-btn-kecil d-btn-wa" href={wa} target="_blank" rel="noopener noreferrer"
            aria-label={(habis ? "Tanya ketersediaan " : "Pesan ") + p.nama + " lewat WhatsApp"}>
            <Icon name="wa" />{habis ? "Tanya stok" : "Pesan WA"}
          </a>
        )}
      </div>
    </article>
  );
}
