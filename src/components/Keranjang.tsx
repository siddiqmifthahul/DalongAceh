import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { fotoProduk } from "./ProductCard";
import { rp } from "../lib/format";
import { sisa } from "../lib/katalog";
import { validasiPesanan, type FieldPesanan, type FormPesanan, type Galat } from "../lib/validasi";
import { pesanLengkap, waUrl } from "../lib/whatsapp";
import { useData } from "../state/data";
import { useKeranjang } from "../state/keranjang";
import { useToast } from "../state/toast";

const FORM_AWAL: FormPesanan = { nama: "", noHp: "", metode: "ambil", alamat: "", slot: "", catatan: "" };

function PesanGalat({ id, pesan }: { id: string; pesan?: string }) {
  if (!pesan) return null;
  return <p className="error" id={id}><Icon name="alert" /><span>{pesan}</span></p>;
}

export function Keranjang() {
  const { produk, pengaturan, sumber, muatUlang, mode } = useData();
  const k = useKeranjang();
  const toast = useToast();
  const [form, setForm] = useState<FormPesanan>(FORM_AWAL);
  const [galat, setGalat] = useState<Galat<FieldPesanan>>({});
  const [galatKirim, setGalatKirim] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [sukses, setSukses] = useState<{ kode: string; url: string | null } | null>(null);
  const tombolTutup = useRef<HTMLButtonElement>(null);
  const fokusSebelum = useRef<HTMLElement | null>(null);

  const poBuka = Date.now() < Date.parse(pengaturan.poTutup);
  const antar = form.metode === "antar";
  const baris = k.items.map(i => ({ i, p: produk.find(x => x.id === i.produkId) })).filter(b => b.p);

  useEffect(() => {
    if (k.terbuka) {
      fokusSebelum.current = document.activeElement as HTMLElement;
      document.getElementById("toko")?.setAttribute("inert", "");
      window.setTimeout(() => tombolTutup.current?.focus(), 60);
      const esc = (e: KeyboardEvent) => e.key === "Escape" && k.tutup();
      window.addEventListener("keydown", esc);
      return () => window.removeEventListener("keydown", esc);
    }
    document.getElementById("toko")?.removeAttribute("inert");
    fokusSebelum.current?.focus?.();
  }, [k.terbuka]); // eslint-disable-line react-hooks/exhaustive-deps

  const tutup = () => {
    k.tutup();
    if (sukses) { setSukses(null); setForm(FORM_AWAL); }
  };

  const ubah = (f: keyof FormPesanan, v: string) => setForm(s => ({ ...s, [f]: v }));

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setGalatKirim(null);
    if (!poBuka) { setGalatKirim("PO sudah ditutup."); return; }
    const v = validasiPesanan(form, pengaturan.slots);
    if (!v.ok) {
      setGalat(v.galat);
      const pertama = (["nama", "noHp", "alamat", "slot", "catatan"] as FieldPesanan[]).find(f => v.galat[f]);
      if (pertama) document.getElementById("f-" + pertama)?.focus();
      return;
    }
    setGalat({});
    setMengirim(true);
    try {
      const { kode, pesanan } = await sumber.buatPesanan({ ...v.data, items: k.items.map(i => ({ produkId: i.produkId, jumlah: i.jumlah })) });
      const url = waUrl(pengaturan.noWhatsApp, pesanLengkap(pesanan, pengaturan.momenLabel));
      setSukses({ kode, url });
      k.kosongkan();
      void muatUlang();
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setGalatKirim(err instanceof Error ? err.message : "Pesanan gagal dikirim.");
      void muatUlang();
    } finally {
      setMengirim(false);
    }
  };

  const kosong = baris.length === 0 && !sukses;

  return (<>
    <div className={"backdrop" + (k.terbuka ? " show" : "")} onClick={tutup} aria-hidden="true" />
    <aside className={"drawer" + (k.terbuka ? " open" : "")} id="keranjang" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden={!k.terbuka}>
      <div className="drawer-head">
        <h2 id="cart-title">Keranjang</h2>
        <button ref={tombolTutup} className="btn btn-outline btn-icon" type="button" onClick={tutup} aria-label="Tutup keranjang"><Icon name="x" /></button>
      </div>
      <div className="drawer-body">
        {sukses ? (
          <div className="success">
            <div className="success-icon"><Icon name="check" /></div>
            <h3>Pesanan tersimpan</h3>
            <p>Simpan kode ini untuk mengecek pesanan Anda.</p>
            <div className="order-code">{sukses.kode}</div>
            <p>Langkah terakhir: kirim pesanan ke WhatsApp penjual. Jika WhatsApp belum terbuka, ketuk tombol di bawah.</p>
            {sukses.url && <a className="btn btn-wa btn-block" href={sukses.url} target="_blank" rel="noopener noreferrer"><Icon name="wa" />Kirim lewat WhatsApp</a>}
            {mode === "demo" && <p className="hint">Mode demo: pesanan hanya tersimpan di browser ini.</p>}
            <button className="btn btn-text" type="button" onClick={tutup}>Kembali ke daftar produk</button>
          </div>
        ) : kosong ? (
          <div className="empty">
            <h3>Keranjang masih kosong</h3>
            <p>Pilih daging, masakan, atau kue dari daftar produk.</p>
            <button className="btn btn-primary" type="button" onClick={() => { tutup(); document.getElementById("produk")?.scrollIntoView({ behavior: "smooth" }); }}>Lihat daftar produk</button>
          </div>
        ) : (<>
          {baris.map(({ i, p }) => {
            const maks = sisa(p!);
            return (
              <div className="cart-item" key={i.produkId}>
                <img src={fotoProduk(p!)} alt="" width={72} height={54} style={{ objectPosition: p!.fokus }} />
                <div>
                  <h3>{p!.nama}</h3>
                  <p className="meta">{rp(p!.harga)}/{p!.satuan}, subtotal {rp(p!.harga * i.jumlah)}</p>
                  <div className="controls">
                    <div className="mini-stepper">
                      <button type="button" aria-label={"Kurangi " + p!.nama} onClick={() => k.atur(p!, i.jumlah - 1)}><Icon name="minus" /></button>
                      <output aria-live="polite" aria-label={"Jumlah " + p!.nama}>{i.jumlah} {p!.satuan}</output>
                      <button type="button" aria-label={"Tambah " + p!.nama} disabled={i.jumlah >= maks} onClick={() => k.atur(p!, i.jumlah + 1)}><Icon name="plus" /></button>
                    </div>
                    <button className="btn btn-text" type="button" onClick={() => { k.atur(p!, 0); toast(p!.nama + " dihapus dari keranjang"); }}>Hapus</button>
                    {i.jumlah >= maks && <span className="limit-note">Batas kuota</span>}
                  </div>
                </div>
              </div>
            );
          })}

          <form className="order-form" id="form-pesanan" onSubmit={kirim} noValidate>
            <h3>Data pemesan</h3>
            <div className="form-field">
              <label htmlFor="f-nama">Nama</label>
              <input className="input" id="f-nama" autoComplete="name" maxLength={50} value={form.nama} onChange={e => ubah("nama", e.target.value)}
                aria-invalid={Boolean(galat.nama) || undefined} aria-describedby="e-nama" />
              <PesanGalat id="e-nama" pesan={galat.nama} />
            </div>
            <div className="form-field">
              <label htmlFor="f-noHp">Nomor WhatsApp</label>
              <input className="input" id="f-noHp" type="tel" inputMode="numeric" autoComplete="tel" maxLength={18} value={form.noHp}
                onChange={e => ubah("noHp", e.target.value)} aria-invalid={Boolean(galat.noHp) || undefined} aria-describedby="h-hp e-noHp" />
              <span className="hint" id="h-hp">Contoh: 0812 3456 7890</span>
              <PesanGalat id="e-noHp" pesan={galat.noHp} />
            </div>
            <div className="form-field">
              <span className="form-label" id="l-metode">Cara terima</span>
              <div className="segmented" role="radiogroup" aria-labelledby="l-metode">
                <label><input type="radio" name="metode" value="ambil" checked={!antar} onChange={() => ubah("metode", "ambil")} /><span>Ambil di dapur</span></label>
                <label><input type="radio" name="metode" value="antar" checked={antar} onChange={() => ubah("metode", "antar")} /><span>Diantar</span></label>
              </div>
            </div>
            {antar && (
              <div className="form-field">
                <label htmlFor="f-alamat">Alamat antar</label>
                <textarea className="textarea" id="f-alamat" maxLength={200} value={form.alamat} onChange={e => ubah("alamat", e.target.value)}
                  aria-invalid={Boolean(galat.alamat) || undefined} aria-describedby="h-alamat e-alamat" />
                <span className="hint" id="h-alamat">Khusus Banda Aceh dan Aceh Besar. Ongkir dikonfirmasi lewat WhatsApp.</span>
                <PesanGalat id="e-alamat" pesan={galat.alamat} />
              </div>
            )}
            <div className="form-field">
              <label htmlFor="f-slot">{antar ? "Jam antar" : "Jam ambil"}</label>
              <select className="select" id="f-slot" value={form.slot} onChange={e => ubah("slot", e.target.value)}
                aria-invalid={Boolean(galat.slot) || undefined} aria-describedby="e-slot">
                <option value="">Pilih jam</option>
                {pengaturan.slots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <PesanGalat id="e-slot" pesan={galat.slot} />
            </div>
            <div className="form-field">
              <label htmlFor="f-catatan">Catatan <span className="hint">(boleh kosong)</span></label>
              <textarea className="textarea" id="f-catatan" maxLength={200} placeholder="Misalnya: daging dipotong kecil untuk sie masak"
                value={form.catatan} onChange={e => ubah("catatan", e.target.value)} aria-describedby="e-catatan" />
              <PesanGalat id="e-catatan" pesan={galat.catatan} />
            </div>
          </form>
        </>)}
      </div>
      {!sukses && !kosong && (
        <div className="drawer-foot">
          {galatKirim && <p className="form-error-box" role="alert">{galatKirim}</p>}
          <div className="total-row"><span>Total</span><strong>{rp(k.total)}</strong></div>
          <button className="btn btn-wa btn-block" type="submit" form="form-pesanan" disabled={mengirim || !poBuka}>
            <Icon name="wa" />{mengirim ? "Menyimpan pesanan…" : poBuka ? "Kirim pesanan lewat WhatsApp" : "PO sudah ditutup"}
          </button>
          <p className="foot-hint">DP dibayar setelah penjual membalas pesan Anda.</p>
        </div>
      )}
    </aside>

    <div className={"cart-bar" + (k.jumlah > 0 && !k.terbuka ? " show" : "")} aria-hidden={!(k.jumlah > 0 && !k.terbuka)}>
      <p><span>{k.items.length} produk di keranjang</span><strong>{rp(k.total)}</strong></p>
      <button className="btn btn-kunyit" type="button" tabIndex={k.jumlah > 0 && !k.terbuka ? 0 : -1} onClick={k.buka}>Lihat keranjang</button>
    </div>
  </>);
}
