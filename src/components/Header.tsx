import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { useKeranjang } from "../state/keranjang";
import { useData } from "../state/data";

export const NAV = [
  ["top", "Beranda"],
  ["andalan", "Andalan"],
  ["produk", "Menu"],
  ["kalkulator", "Hitung Porsi"],
  ["cek-pesanan", "Cek Pesanan"]
] as const;
const IDS = NAV.map(n => n[0]);

/** Menandai menu yang sedang terlihat di layar (garis emas di bawah menu aktif). */
function useBagianAktif(ids: readonly string[]): string {
  const [aktif, setAktif] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map(id => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e));
    if (!("IntersectionObserver" in window) || !els.length) return;
    const obs = new IntersectionObserver(entri => {
      const terlihat = entri.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (terlihat) setAktif(terlihat.target.id);
    }, { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] });
    els.forEach(e => obs.observe(e));
    return () => obs.disconnect();
  }, [ids]);
  return aktif;
}

/** true setelah halaman digulir sedikit: header menjadi lebih ringkas. */
function useTergulung(batas = 24): boolean {
  const [tergulung, setTergulung] = useState(false);
  useEffect(() => {
    const cek = () => setTergulung(window.scrollY > batas);
    cek();
    window.addEventListener("scroll", cek, { passive: true });
    return () => window.removeEventListener("scroll", cek);
  }, [batas]);
  return tergulung;
}

export function Header() {
  const { jumlah, buka } = useKeranjang();
  const { pengaturan } = useData();
  const aktif = useBagianAktif(IDS);
  const tergulung = useTergulung();

  return (
    <header className="d-header on-dark" data-gulung={tergulung}>
      <div className="wrap d-header-inner">
        <Link className="d-header-logo" to="/" aria-label={pengaturan.namaUsaha + ", ke beranda"}><Logo /></Link>
        <nav className="d-nav" aria-label="Navigasi utama">
          {NAV.map(([id, label]) => (
            <a key={id} href={"#" + id} aria-current={aktif === id ? "location" : undefined}>{label}</a>
          ))}
        </nav>
        <button className="d-cart-btn" type="button" onClick={buka} aria-haspopup="dialog" aria-controls="keranjang"
          aria-label={"Buka keranjang, " + jumlah + " item"}>
          <Icon name="troli" />
          {/* key berganti saat jumlah berubah, sehingga animasi "memantul" diputar ulang */}
          <span key={jumlah} className="d-cart-badge" data-empty={jumlah === 0} aria-hidden="true">{jumlah}</span>
        </button>
        <details className="d-mobile-menu">
          <summary className="d-icon-btn" aria-label="Buka menu"><Icon name="menu" /></summary>
          <nav className="d-mobile-panel" aria-label="Navigasi utama (seluler)">
            {NAV.map(([id, label]) => (
              <a key={id} href={"#" + id} onClick={e => (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open")}>{label}</a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
