import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { ProductCard, fotoProduk } from "../../components/ProductCard";
import { kapitalAwal, rapikan, rp } from "../../lib/format";
import { bacaCiri, validasiProduk, type FieldProduk, type Galat } from "../../lib/validasi";
import { potongFoto } from "../../lib/foto";
import { KATEGORI, SATUAN, type Kategori, type Momen, type Produk, type ProdukInput, type Satuan } from "../../lib/types";
import { useData } from "../../state/data";
import { useToast } from "../../state/toast";
import { useAdmin } from "./useAdmin";

interface FormP { id?: string; nama: string; kategori: Kategori; satuan: Satuan; harga: string; kuota: string; deskripsi: string; ciri: string; momen: Momen[]; aktif: boolean; foto: string | null; fokus: string; urutan: number; terpesan: number }

const kosong = (urutan: number): FormP => ({ nama: "", kategori: "daging", satuan: "kg", harga: "", kuota: "", deskripsi: "", ciri: "", momen: ["meugang"], aktif: true, foto: null, fokus: "50% 50%", urutan, terpesan: 0 });
const dariProduk = (p: Produk): FormP => ({ ...p, harga: String(p.harga), kuota: String(p.kuota), ciri: p.ciri.join(", ") });
const keInput = (f: FormP): ProdukInput => ({
  id: f.id, nama: kapitalAwal(rapikan(f.nama, 80)), kategori: f.kategori, satuan: f.satuan,
  harga: Number(f.harga.replace(/\D/g, "")) || 0, kuota: Number(f.kuota.replace(/\D/g, "")) || 0,
  deskripsi: rapikan(f.deskripsi, 300), ciri: bacaCiri(f.ciri), momen: f.momen, aktif: f.aktif, foto: f.foto, fokus: f.fokus, urutan: f.urutan
});

function PesanGalat({ id, pesan }: { id: string; pesan?: string }) {
  return pesan ? <p className="error" id={id}><Icon name="alert" /><span>{pesan}</span></p> : null;
}

function DialogProduk({ awal, onTutup, onSimpan }: { awal: FormP | null; onTutup: () => void; onSimpan: (p: ProdukInput, foto: Blob | null) => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { pengaturan } = useData();
  const [f, setF] = useState<FormP>(kosong(0));
  const [blob, setBlob] = useState<Blob | null>(null);
  const [pratinjauFoto, setPratinjauFoto] = useState<string | null>(null);
  const [galat, setGalat] = useState<Galat<FieldProduk>>({});
  const [galatSimpan, setGalatSimpan] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    if (awal) { setF(awal); setBlob(null); setPratinjauFoto(null); setGalat({}); setGalatSimpan(null); ref.current?.showModal(); }
    else ref.current?.close();
  }, [awal]);
  useEffect(() => () => { if (pratinjauFoto) URL.revokeObjectURL(pratinjauFoto); }, [pratinjauFoto]);

  const set = <K extends keyof FormP>(k: K, v: FormP[K]) => setF(s => ({ ...s, [k]: v }));
  const input = keInput(f);
  const fotoTampil = pratinjauFoto ?? f.foto;

  const pilihFoto = async (file: File | undefined) => {
    setGalat(g => ({ ...g, foto: undefined }));
    if (!file) return;
    try {
      const b = await potongFoto(file);
      setBlob(b);
      setPratinjauFoto(URL.createObjectURL(b));
      set("fokus", "50% 50%");
    } catch (e) {
      setGalat(g => ({ ...g, foto: e instanceof Error ? e.message : "Foto gagal diproses." }));
    }
  };

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    const cek = validasiProduk({ ...input, foto: fotoTampil ? (blob ? "https://pratinjau.local/foto.webp" : input.foto) : null }, f.terpesan);
    setGalat(cek);
    const pertama = Object.keys(cek)[0];
    if (pertama) { document.getElementById("p-" + pertama)?.focus(); return; }
    setMenyimpan(true);
    setGalatSimpan(null);
    try { await onSimpan(input, blob); }
    catch (err) { setGalatSimpan(err instanceof Error ? err.message : "Produk gagal disimpan."); }
    finally { setMenyimpan(false); }
  };

  const panjangDesk = rapikan(f.deskripsi, 300).length;
  const contoh: Produk = { ...input, id: "pratinjau", terpesan: f.terpesan, kuota: input.kuota || 1, foto: fotoTampil };

  return (
    <dialog ref={ref} className="modal" aria-labelledby="pd-title" onClose={onTutup} onCancel={onTutup}>
      <div className="modal-grid">
        <form className="modal-form" onSubmit={kirim} noValidate>
          <h2 id="pd-title">{f.id ? "Ubah produk" : "Tambah produk"}</h2>
          <p>Isi data produk. Pratinjau kartunya muncul di samping.</p>
          {galatSimpan && <p className="form-error-box" role="alert">{galatSimpan}</p>}
          <div className="form-field"><label htmlFor="p-nama">Nama produk</label>
            <input className="input" id="p-nama" maxLength={60} value={f.nama} onChange={e => set("nama", e.target.value)} aria-invalid={Boolean(galat.nama) || undefined} aria-describedby="pe-nama" />
            <PesanGalat id="pe-nama" pesan={galat.nama} /></div>
          <div className="two-col">
            <div className="form-field"><label htmlFor="p-kategori">Kategori</label>
              <select className="select" id="p-kategori" value={f.kategori} onChange={e => set("kategori", e.target.value as Kategori)}>
                {(Object.keys(KATEGORI) as Kategori[]).map(k => <option key={k} value={k}>{KATEGORI[k]}</option>)}
              </select></div>
            <div className="form-field"><label htmlFor="p-satuan">Satuan</label>
              <select className="select" id="p-satuan" value={f.satuan} onChange={e => set("satuan", e.target.value as Satuan)}>
                {SATUAN.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div className="form-field"><label htmlFor="p-harga">Harga (Rp)</label>
              <input className="input" id="p-harga" inputMode="numeric" maxLength={11} value={f.harga} onChange={e => set("harga", e.target.value.replace(/\D/g, ""))} aria-invalid={Boolean(galat.harga) || undefined} aria-describedby="pe-harga" />
              <PesanGalat id="pe-harga" pesan={galat.harga} /></div>
            <div className="form-field"><label htmlFor="p-kuota">Kuota {f.terpesan > 0 && <span className="hint">(terpesan {f.terpesan})</span>}</label>
              <input className="input" id="p-kuota" inputMode="numeric" maxLength={5} value={f.kuota} onChange={e => set("kuota", e.target.value.replace(/\D/g, ""))} aria-invalid={Boolean(galat.kuota) || undefined} aria-describedby="pe-kuota" />
              <PesanGalat id="pe-kuota" pesan={galat.kuota} /></div>
          </div>
          <div className="form-field"><label htmlFor="p-deskripsi">Deskripsi singkat</label>
            <textarea className="textarea" id="p-deskripsi" maxLength={200} value={f.deskripsi} onChange={e => set("deskripsi", e.target.value)} aria-invalid={Boolean(galat.deskripsi) || undefined} aria-describedby="p-counter pe-deskripsi" />
            <span className={"counter" + (panjangDesk > 150 ? " over" : "")} id="p-counter">{panjangDesk}/150</span>
            <PesanGalat id="pe-deskripsi" pesan={galat.deskripsi} /></div>
          <div className="form-field"><label htmlFor="p-ciri">Ciri khas <span className="hint">(maks. 3, pisahkan dengan koma)</span></label>
            <input className="input" id="p-ciri" maxLength={60} placeholder="Misalnya: Renyah, Manis, Hantaran" value={f.ciri} onChange={e => set("ciri", e.target.value)} aria-invalid={Boolean(galat.ciri) || undefined} aria-describedby="pe-ciri" />
            <PesanGalat id="pe-ciri" pesan={galat.ciri} /></div>
          <fieldset className="form-field"><legend className="form-label">Tersedia untuk momen</legend>
            <div className="check-row">
              {(["meugang", "kenduri"] as Momen[]).map(m => (
                <label className="opt" key={m}><input type="checkbox" id={m === "meugang" ? "p-momen" : undefined} checked={f.momen.includes(m)}
                  onChange={e => set("momen", e.target.checked ? [...f.momen, m] : f.momen.filter(x => x !== m))} />{m === "meugang" ? "Meugang" : "Kenduri"}</label>
              ))}
            </div>
            <PesanGalat id="pe-momen" pesan={galat.momen} /></fieldset>
          <div className="form-field"><label htmlFor="p-foto">Foto produk</label>
            <input className="input" id="p-foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void pilihFoto(e.target.files?.[0])} aria-describedby="h-foto pe-foto" />
            <span className="hint" id="h-foto">JPG, PNG, atau WebP, maks. 5 MB. Foto otomatis dipotong ke ukuran seragam 4:3.</span>
            <PesanGalat id="pe-foto" pesan={galat.foto} /></div>
          <label className="opt"><input type="checkbox" checked={f.aktif} onChange={e => set("aktif", e.target.checked)} />Tampilkan di katalog</label>
          <div className="modal-actions">
            <button className="btn btn-outline" type="button" onClick={onTutup}>Batal</button>
            <button className="btn btn-primary" type="submit" disabled={menyimpan}>{menyimpan ? "Menyimpan…" : f.id ? "Simpan perubahan" : "Simpan produk"}</button>
          </div>
        </form>
        <div className="modal-preview">
          <h3>Pratinjau kartu</h3>
          <p>Begini tampilan produk di katalog pembeli.</p>
          <ProductCard produk={contoh} noWhatsApp={pengaturan.noWhatsApp} poBuka pratinjau />
        </div>
      </div>
    </dialog>
  );
}

function DialogHapus({ produk, onTutup, onHapus }: { produk: Produk | null; onTutup: () => void; onHapus: () => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [proses, setProses] = useState(false);
  useEffect(() => { if (produk) ref.current?.showModal(); else ref.current?.close(); }, [produk]);
  return (
    <dialog ref={ref} className="modal small" aria-labelledby="dd-title" onClose={onTutup} onCancel={onTutup}>
      <div className="modal-small">
        <h2 id="dd-title">Hapus produk?</h2>
        <p>{produk?.nama} akan hilang dari katalog dan keranjang pembeli. Pesanan yang sudah masuk tetap tersimpan.</p>
        <div className="modal-actions">
          <button className="btn btn-outline" type="button" onClick={onTutup}>Batal</button>
          <button className="btn btn-danger" type="button" disabled={proses} onClick={async () => { setProses(true); await onHapus(); setProses(false); }}>Hapus produk</button>
        </div>
      </div>
    </dialog>
  );
}

export function ProdukAdmin() {
  const { sumber, produk, galat, segarkan } = useAdmin();
  const toast = useToast();
  const [edit, setEdit] = useState<FormP | null>(null);
  const [hapus, setHapus] = useState<Produk | null>(null);

  const simpan = async (p: ProdukInput, foto: Blob | null) => {
    const url = foto ? await sumber.unggahFoto(foto) : p.foto;
    await sumber.simpanProduk({ ...p, foto: url });
    setEdit(null);
    toast(p.id ? "Perubahan " + p.nama + " tersimpan" : p.nama + " ditambahkan ke katalog");
    await segarkan();
  };

  return (<>
    <div className="panel-head">
      <div><h1>Produk</h1><p>{produk.length} produk. Ubah harga, kuota, atau foto kapan saja.</p></div>
      <button className="btn btn-primary" type="button" onClick={() => setEdit(kosong(produk.length + 1))}><Icon name="plus" />Tambah produk</button>
    </div>
    {galat && <p className="form-error-box" role="alert">{galat}</p>}
    <div className="rows" style={{ ["--cols" as string]: "minmax(220px,2.2fr) 1fr 1.2fr .9fr auto" }}>
      <div className="row-head"><span>Produk</span><span>Harga</span><span>Kuota</span><span>Status</span><span>Aksi</span></div>
      {produk.map(p => (
        <div className="row" key={p.id}>
          <div className="prod-cell"><img src={fotoProduk(p)} alt="" width={60} height={45} style={{ objectPosition: p.fokus }} />
            <div><strong>{p.nama}</strong><span>{KATEGORI[p.kategori]}</span></div></div>
          <div><span className="m-label">Harga</span>{rp(p.harga)}/{p.satuan}</div>
          <div><span className="m-label">Kuota</span>{p.terpesan} terpesan dari {p.kuota}</div>
          <div>{p.aktif ? <span className="pill ok">Tampil</span> : <span className="pill off">Disembunyikan</span>}</div>
          <div className="row-actions">
            <button className="btn btn-outline" type="button" onClick={() => setEdit(dariProduk(p))}><Icon name="edit" />Ubah</button>
            <button className="btn btn-text" type="button" onClick={() => setHapus(p)}><Icon name="trash" />Hapus</button>
          </div>
        </div>
      ))}
    </div>
    <DialogProduk awal={edit} onTutup={() => setEdit(null)} onSimpan={simpan} />
    <DialogHapus produk={hapus} onTutup={() => setHapus(null)} onHapus={async () => {
      if (!hapus) return;
      try { await sumber.hapusProduk(hapus.id); toast(hapus.nama + " dihapus"); setHapus(null); await segarkan(); }
      catch (e) { toast(e instanceof Error ? e.message : "Produk gagal dihapus."); }
    }} />
  </>);
}
