/**
 * Foto produk: hanya JPG/PNG/WebP (SVG ditolak: bisa berisi script),
 * dipotong ke tengah 4:3, diperkecil ke 800x600, di-encode ulang ke WebP.
 * Encode ulang lewat canvas juga membuang metadata EXIF (mis. lokasi GPS).
 */
export const FORMAT_FOTO = ["image/jpeg", "image/png", "image/webp"];
export const MAKS_FOTO_BYTE = 5 * 1024 * 1024;

export function cekFileFoto(f: { type: string; size: number }): string | null {
  if (!FORMAT_FOTO.includes(f.type)) return "Format foto harus JPG, PNG, atau WebP.";
  if (f.size > MAKS_FOTO_BYTE) return "Ukuran foto maksimal 5 MB.";
  return null;
}

/** Hitung area potong tengah dengan rasio target (default 4:3). */
export function areaPotong(w: number, h: number, rasio = 4 / 3): { sx: number; sy: number; sw: number; sh: number } {
  if (w / h > rasio) {
    const sw = h * rasio;
    return { sx: (w - sw) / 2, sy: 0, sw, sh: h };
  }
  const sh = w / rasio;
  return { sx: 0, sy: (h - sh) / 2, sw: w, sh };
}

export function potongFoto(file: File, lebar = 800, tinggi = 600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const err = cekFileFoto(file);
    if (err) { reject(new Error(err)); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const a = areaPotong(img.naturalWidth, img.naturalHeight, lebar / tinggi);
      const c = document.createElement("canvas");
      c.width = lebar; c.height = tinggi;
      const ctx = c.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Browser tidak mendukung pengolahan foto.")); return; }
      ctx.drawImage(img, a.sx, a.sy, a.sw, a.sh, 0, 0, lebar, tinggi);
      URL.revokeObjectURL(url);
      c.toBlob(b => (b ? resolve(b) : reject(new Error("Foto gagal diproses."))), "image/webp", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Foto tidak bisa dibaca. Coba file lain.")); };
    img.src = url;
  });
}

export function blobKeDataUrl(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Foto gagal dibaca."));
    r.readAsDataURL(b);
  });
}
