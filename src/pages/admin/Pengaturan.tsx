import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { rapikan } from "../../lib/format";
import { isPengaturan } from "../../lib/skema";
import { normalWA } from "../../lib/whatsapp";
import { resetDemo } from "../../services/demo";
import { useData } from "../../state/data";
import { useAuth } from "../../state/auth";
import { useToast } from "../../state/toast";

/** ISO -> nilai input datetime-local dalam WIB */
function keLokal(iso: string): string {
  const d = new Date(Date.parse(iso) + 7 * 3600_000);
  return d.toISOString().slice(0, 16);
}
const dariLokal = (v: string) => v + ":00+07:00";

export function PengaturanAdmin() {
  const { pengaturan, sumber, muatUlang } = useData();
  const { peran } = useAuth();
  const toast = useToast();
  const [namaUsaha, setNamaUsaha] = useState(pengaturan.namaUsaha);
  const [wa, setWa] = useState(pengaturan.noWhatsApp);
  const [momen, setMomen] = useState(pengaturan.momenLabel);
  const [tutup, setTutup] = useState(keLokal(pengaturan.poTutup));
  const [slots, setSlots] = useState(pengaturan.slots.join("\n"));
  const [galat, setGalat] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    setNamaUsaha(pengaturan.namaUsaha); setWa(pengaturan.noWhatsApp); setMomen(pengaturan.momenLabel);
    setTutup(keLokal(pengaturan.poTutup)); setSlots(pengaturan.slots.join("\n"));
  }, [pengaturan]);

  const simpan = async (e: FormEvent) => {
    e.preventDefault();
    const nomor = normalWA(wa);
    if (!nomor) { setGalat("Nomor WhatsApp tidak valid. Contoh: 0822 6145 1487."); return; }
    const data = {
      namaUsaha: rapikan(namaUsaha, 60), noWhatsApp: nomor, momenLabel: rapikan(momen, 60),
      poTutup: dariLokal(tutup), slots: slots.split("\n").map(s => rapikan(s, 80)).filter(Boolean)
    };
    if (!isPengaturan(data)) { setGalat("Periksa lagi isian: nama 2–60 karakter, 1–12 jam ambil, tanpa tanda < atau >."); return; }
    setGalat(null); setMenyimpan(true);
    try { await sumber.simpanPengaturan(data); await muatUlang(); toast("Pengaturan tersimpan"); }
    catch (err) { setGalat(err instanceof Error ? err.message : "Pengaturan gagal disimpan."); }
    finally { setMenyimpan(false); }
  };

  return (<>
    <div className="panel-head"><div><h1>Pengaturan toko</h1><p>Momen aktif, batas PO, jam ambil, dan nomor WhatsApp penerima pesanan.</p></div></div>
    <form className="settings" onSubmit={simpan} noValidate>
      {galat && <p className="form-error-box" role="alert">{galat}</p>}
      <div className="two-col">
        <div className="form-field"><label htmlFor="s-nama">Nama usaha</label>
          <input className="input" id="s-nama" maxLength={60} value={namaUsaha} onChange={e => setNamaUsaha(e.target.value)} /></div>
        <div className="form-field"><label htmlFor="s-wa">Nomor WhatsApp penerima pesanan</label>
          <input className="input" id="s-wa" type="tel" inputMode="numeric" maxLength={18} value={wa} onChange={e => setWa(e.target.value)} /></div>
        <div className="form-field"><label htmlFor="s-momen">Nama momen</label>
          <input className="input" id="s-momen" maxLength={60} value={momen} onChange={e => setMomen(e.target.value)} placeholder="Meugang Ramadan 2027" /></div>
        <div className="form-field"><label htmlFor="s-tutup">PO ditutup (WIB)</label>
          <input className="input" id="s-tutup" type="datetime-local" value={tutup} onChange={e => setTutup(e.target.value)} /></div>
      </div>
      <div className="form-field"><label htmlFor="s-slots">Jam ambil/antar <span className="hint">(satu per baris)</span></label>
        <textarea className="textarea" id="s-slots" rows={4} value={slots} onChange={e => setSlots(e.target.value)} /></div>
      <div className="modal-actions"><button className="btn btn-primary" type="submit" disabled={menyimpan}>{menyimpan ? "Menyimpan…" : "Simpan pengaturan"}</button></div>
    </form>

    {peran === "demo" && (
      <div className="danger-zone">
        <h2 className="sub-title">Data demo</h2>
        <p>Kembalikan produk, pesanan, dan pengaturan demo ke kondisi awal. Berguna sebelum presentasi.</p>
        <button className="btn btn-outline" type="button" onClick={async () => { resetDemo(); await muatUlang(); toast("Data demo dikembalikan ke awal"); }}>
          <Icon name="reset" />Reset data demo
        </button>
      </div>
    )}
  </>);
}
