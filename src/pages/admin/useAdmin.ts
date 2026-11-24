import { useCallback, useEffect, useState } from "react";
import type { Pesanan, Produk } from "../../lib/types";
import { useData } from "../../state/data";

/** Memuat data khusus admin (semua produk termasuk nonaktif + semua pesanan). */
export function useAdmin() {
  const { sumber, muatUlang } = useData();
  const [produk, setProduk] = useState<Produk[]>([]);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  const segarkan = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([sumber.semuaProduk(), sumber.daftarPesanan()]);
      setProduk(p); setPesanan(o); setGalat(null);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Data gagal dimuat.");
    } finally {
      setMemuat(false);
    }
    void muatUlang(); // jaga agar halaman toko ikut terbaru
  }, [sumber, muatUlang]);

  useEffect(() => { void segarkan(); }, [segarkan]);

  return { sumber, produk, pesanan, memuat, galat, segarkan };
}
