import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { sesiDemoAktif, keluarDemo as hapusSesiDemo } from "../lib/authDemo";
import { PENGATURAN_AWAL } from "../lib/seed";
import type { Pengaturan, Produk } from "../lib/types";
import { sumberDemo } from "../services/demo";
import { sumberLive } from "../services/live";
import { supabase, supabaseTersedia } from "../services/supabase";
import type { ModeData, SumberData } from "../services/types";

interface DataCtx {
  sumber: SumberData;
  mode: ModeData;
  /** true jika Supabase belum dikonfigurasi, sehingga toko memakai data lokal. */
  tanpaServer: boolean;
  produk: Produk[];
  pengaturan: Pengaturan;
  status: "memuat" | "siap" | "galat";
  galat: string | null;
  muatUlang: () => Promise<void>;
  aktifkanDemo: () => void;
  akhiriDemo: () => void;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(() => sesiDemoAktif() || !supabaseTersedia);
  const sumber = useMemo(() => (demo || !supabase ? sumberDemo() : sumberLive(supabase)), [demo]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [pengaturan, setPengaturan] = useState<Pengaturan>(PENGATURAN_AWAL);
  const [status, setStatus] = useState<DataCtx["status"]>("memuat");
  const [galat, setGalat] = useState<string | null>(null);

  const muatUlang = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([sumber.daftarProduk(), sumber.pengaturan()]);
      setProduk(p);
      setPengaturan(s);
      setGalat(null);
      setStatus("siap");
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Data gagal dimuat.");
      setStatus("galat");
    }
  }, [sumber]);

  useEffect(() => {
    setStatus("memuat");
    void muatUlang();
  }, [muatUlang]);

  const nilai = useMemo<DataCtx>(() => ({
    sumber, mode: sumber.mode, tanpaServer: !supabaseTersedia, produk, pengaturan, status, galat, muatUlang,
    aktifkanDemo: () => setDemo(true),
    akhiriDemo: () => { hapusSesiDemo(); setDemo(!supabaseTersedia); }
  }), [sumber, produk, pengaturan, status, galat, muatUlang]);

  return <Ctx.Provider value={nilai}>{children}</Ctx.Provider>;
}

export function useData(): DataCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useData harus di dalam DataProvider");
  return c;
}
