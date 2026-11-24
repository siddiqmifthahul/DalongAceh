import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Andalan } from "../components/Andalan";
import { Katalog } from "../components/Katalog";
import { Kalkulator } from "../components/Kalkulator";
import { CaraPesan } from "../components/CaraPesan";
import { Footer } from "../components/Footer";
import { Keranjang } from "../components/Keranjang";
import { useData } from "../state/data";
import { useAuth } from "../state/auth";

function BannerMode() {
  const { mode, tanpaServer } = useData();
  const { peran } = useAuth();
  if (mode !== "demo") return null;
  return (
    <div className="demo-banner" role="note">
      <div className="wrap">
        {tanpaServer
          ? "Mode lokal: database belum tersambung, data contoh disimpan di browser ini."
          : <>Mode demo aktif: data hanya tersimpan di browser ini. {peran === "demo" && <Link to="/admin">Kembali ke dasbor demo</Link>}</>}
      </div>
    </div>
  );
}

export function Home() {
  return (<>
    <a className="skip-link" href="#produk">Lewati ke daftar produk</a>
    <div id="toko">
      <BannerMode />
      <Header />
      <main id="top">
        <Hero />
        <Andalan />
        <Katalog />
        <Kalkulator />
        <CaraPesan />
      </main>
      <Footer />
    </div>
    <Keranjang />
  </>);
}

export function TidakDitemukan() {
  return (
    <main className="notfound">
      <div className="songket thin" role="presentation" />
      <div className="wrap notfound-inner">
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat yang Anda buka tidak ada. Mungkin salah ketik atau halamannya sudah dipindah.</p>
        <Link className="btn btn-primary" to="/">Kembali ke beranda</Link>
      </div>
    </main>
  );
}
