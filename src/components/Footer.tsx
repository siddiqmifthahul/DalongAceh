import { Link } from "react-router-dom";
import { useData } from "../state/data";
import { formatWA, waUrl } from "../lib/whatsapp";

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
  const wa = waUrl(pengaturan.noWhatsApp, "Assalamu'alaikum, saya mau tanya soal pesanan Meugang.");
  return (
    <footer className="site-footer on-dark">
      <div className="songket thin" role="presentation" />
      <div className="wrap footer-inner">
        <div>
          <h2>{pengaturan.namaUsaha}</h2>
          <p>Daging Meugang, masakan kenduri, dan kue tradisional Aceh.</p>
          <p>Banda Aceh</p>
        </div>
        <div>
          <h3>Jam buka</h3>
          <p>Senin–Sabtu, 07.00–17.00 WIB</p>
          <p>Hari Meugang mulai 05.30 WIB</p>
        </div>
        <div>
          <h3>Hubungi</h3>
          <ul className="footer-links">
            {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp {formatWA(pengaturan.noWhatsApp)}</a></li>}
            <li><Link to="/admin">Masuk dasbor penjual</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-note">
        <p>Website tugas program CHAT EKRAF. Harga dan kuota dapat berubah sewaktu-waktu.</p>
        <details className="credits">
          <summary>Kredit foto (Wikimedia Commons)</summary>
          <ul>
            {KREDIT.map(([file, judul, oleh]) => (
              <li key={file}><a href={"https://commons.wikimedia.org/wiki/File:" + file} target="_blank" rel="noopener noreferrer">{judul}</a>, {oleh}</li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}
