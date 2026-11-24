import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { Gelombang } from "./Gelombang";
import { NAV } from "./Header";
import { useData } from "../state/data";
import { formatWA, waUrl } from "../lib/whatsapp";
import { useMuncul } from "./useMuncul";

const KREDIT = [
  ["Meat_Vendor_in_Banda_Aceh_During_Meugang.jpg", "Pedagang daging saat Meugang di Banda Aceh", "Si Gam, CC BY-SA 4.0"],
  ["Produk_daging_sapi.jpg", "Produk daging sapi", "Nafisaacdr, CC BY 4.0"],
  ["Buffalo_meat_sliced_(Kathmandu,_Nepal).jpg", "Daging kerbau (foto dari Kathmandu, Nepal)", "白蛇の騎士, CC BY-SA 4.0"],
  ["Hidangan_Masakan_Aceh.jpg", "Hidangan masakan Aceh (ilustrasi untuk Sie Reuboh)", "Fitri Penyalai, CC BY-SA 4.0"],
  ["Kuah_Beulangong.JPG", "Kuah Beulangong", "Si Gam, CC BY-SA 4.0"],
  ["Roti_Cane_Kari_Kambing_Aceh.jpg", "Roti cane kari kambing Aceh", "Gunawan Kartapranata, CC BY-SA 3.0"],
  ["Timphan_Asoe_Kaya.jpg", "Timphan asoe kaya", "Si Gam, CC BY-SA 4.0"],
  ["Bh%C3%B4i.JPG", "Bhôi", "Si Gam, CC BY-SA 3.0"],
  ["Keukaraih.JPG", "Keukarah", "Si Gam, CC BY-SA 3.0"]
] as const;

export function Footer() {
  const { pengaturan } = useData();
  const muncul = useMuncul<HTMLParagraphElement>(0.5);
  const wa = waUrl(pengaturan.noWhatsApp, "Assalamu'alaikum, saya mau tanya soal pesanan Meugang.");
  return (
    <footer className="d-footer on-dark">
      <Gelombang posisi="atas" />
      <div className="wrap d-footer-atas">
        <Logo />
        <nav className="d-footer-nav" aria-label="Navigasi bawah">
          {NAV.map(([id, label]) => <a key={id} href={"#" + id}>{label}</a>)}
        </nav>
        {wa && (
          <a className="d-footer-wa" href={wa} target="_blank" rel="noopener noreferrer" aria-label={"WhatsApp " + formatWA(pengaturan.noWhatsApp)}>
            <Icon name="wa" />
          </a>
        )}
      </div>
      <div className="wrap d-footer-info">
        <p><strong>Jam buka</strong> Senin–Sabtu, 07.00–17.00 WIB, hari Meugang mulai 05.30 WIB</p>
        {wa && <p><strong>WhatsApp</strong> <a href={wa} target="_blank" rel="noopener noreferrer">{formatWA(pengaturan.noWhatsApp)}</a></p>}
        <p><strong>Lokasi</strong> Banda Aceh. <Link to="/admin">Masuk dasbor penjual</Link></p>
      </div>
      <div className="wrap">
        <details className="credits">
          <summary>Kredit foto (Wikimedia Commons)</summary>
          <ul>
            {KREDIT.map(([file, judul, oleh]) => (
              <li key={file}><a href={"https://commons.wikimedia.org/wiki/File:" + file} target="_blank" rel="noopener noreferrer">{judul}</a>, {oleh}</li>
            ))}
          </ul>
        </details>
        <p className="d-footer-copy" ref={muncul}><span>© 2026 {pengaturan.namaUsaha}. Website tugas program CHAT EKRAF.</span></p>
      </div>
    </footer>
  );
}
