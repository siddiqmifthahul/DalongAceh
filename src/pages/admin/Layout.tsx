import { useEffect } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Icon, type NamaIkon } from "../../components/Icon";
import { useAuth } from "../../state/auth";
import { useData } from "../../state/data";
import { useToast } from "../../state/toast";

export function AdminTop({ masuk = false }: { masuk?: boolean }) {
  const { keluar, peran, email } = useAuth();
  const { pengaturan } = useData();
  const toast = useToast();
  const nav = useNavigate();
  return (
    <header className="admin-top on-dark">
      <div className="wrap admin-top-inner">
        <Link className="brand" to="/admin">
          <span className="brand-mark"><Icon name="kuali" /></span>
          <span><span className="brand-name">Dasbor {pengaturan.namaUsaha.replace(/^Dapur\s+/i, "")}</span>
            <span className="brand-sub">{peran === "penjual" && email ? email : "Kelola pesanan Meugang"}</span></span>
        </Link>
        {peran === "demo" && <span className="demo-badge">Mode demo</span>}
        <Link className="btn btn-text link-store" to="/"><Icon name="store" />Lihat toko</Link>
        {masuk && (
          <button className="btn btn-text" type="button" onClick={async () => { await keluar(); toast("Anda sudah keluar"); nav("/admin/login"); }}>
            <Icon name="logout" />Keluar
          </button>
        )}
      </div>
    </header>
  );
}

const MENU: [string, string, NamaIkon][] = [
  ["/admin", "Ringkasan", "home"],
  ["/admin/produk", "Produk", "box"],
  ["/admin/pesanan", "Pesanan", "list"],
  ["/admin/rekap", "Rekap", "chart"],
  ["/admin/pengaturan", "Pengaturan", "gear"]
];

export function AdminLayout() {
  const { peran, memeriksa, cekSesiDemo } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  // Sesi demo berlaku 30 menit: cek berkala
  useEffect(() => {
    if (peran !== "demo") return;
    const t = window.setInterval(() => {
      if (!cekSesiDemo()) { toast("Sesi demo berakhir setelah 30 menit. Silakan masuk lagi."); nav("/admin/login"); }
    }, 30_000);
    return () => window.clearInterval(t);
  }, [peran, cekSesiDemo, toast, nav]);

  if (memeriksa) return <main className="login-wrap"><p>Memeriksa sesi…</p></main>;
  if (peran === "tamu") return <Navigate to="/admin/login" replace />;

  return (<>
    <AdminTop masuk />
    {peran === "demo" && (
      <div className="demo-banner"><div className="wrap">Mode demo: perubahan hanya tersimpan di browser ini dan tidak mengubah data toko yang asli.</div></div>
    )}
    <div className="admin-shell">
      <nav className="admin-nav" aria-label="Menu dasbor">
        {MENU.map(([to, label, ikon]) => (
          <NavLink key={to} to={to} end={to === "/admin"}><Icon name={ikon} />{label}</NavLink>
        ))}
      </nav>
      <main className="admin-main" id="admin-main"><Outlet /></main>
    </div>
  </>);
}
