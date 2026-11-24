import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { useKeranjang } from "../state/keranjang";
import { useData } from "../state/data";

const NAV = [
  ["#produk", "Produk"],
  ["#kalkulator", "Hitung porsi"],
  ["#cara-pesan", "Cara pesan"],
  ["#cek-pesanan", "Cek pesanan"]
] as const;

export function Header() {
  const { jumlah, buka } = useKeranjang();
  const { pengaturan } = useData();
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="brand" to="/" aria-label={pengaturan.namaUsaha + ", ke beranda"}>
          <span className="brand-mark"><Icon name="kuali" /></span>
          <span><span className="brand-name">{pengaturan.namaUsaha}</span><span className="brand-sub">Meugang & kenduri, Banda Aceh</span></span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          {NAV.map(([href, label]) => <a key={href} className="nav-link" href={href}>{label}</a>)}
        </nav>
        <button className="btn btn-outline" type="button" onClick={buka} aria-haspopup="dialog" aria-controls="keranjang">
          <Icon name="bag" /><span className="cart-label">Keranjang</span>
          <span className="count-badge" data-empty={jumlah === 0} aria-label={jumlah + " item di keranjang"}>{jumlah}</span>
        </button>
        <details className="mobile-menu">
          <summary className="btn btn-outline btn-icon" aria-label="Buka menu"><Icon name="menu" /></summary>
          <nav className="mobile-menu-panel" aria-label="Navigasi utama (seluler)">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} onClick={e => (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open")}>{label}</a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
