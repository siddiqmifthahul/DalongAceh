import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { aturJumlah, jumlahItem, sesuaikanKeranjang, tambahKeKeranjang, totalKeranjang } from "../lib/keranjang";
import { arrayOf, isItemKeranjang } from "../lib/skema";
import { bacaAman, KUNCI, tulisAman } from "../lib/storage";
import type { ItemKeranjang, Produk } from "../lib/types";
import { useData } from "./data";

const isCart = arrayOf(isItemKeranjang, 20);

interface KeranjangCtx {
  items: ItemKeranjang[];
  total: number;
  jumlah: number;
  terbuka: boolean;
  buka: () => void;
  tutup: () => void;
  tambah: (p: Produk, jumlah?: number) => number;
  atur: (p: Produk, jumlah: number) => void;
  kosongkan: () => void;
}

const Ctx = createContext<KeranjangCtx | null>(null);

export function KeranjangProvider({ children }: { children: ReactNode }) {
  const { produk, status } = useData();
  const [items, setItems] = useState<ItemKeranjang[]>(() => bacaAman(KUNCI.keranjang, isCart, []));
  const [terbuka, setTerbuka] = useState(false);

  // Rapikan keranjang setiap kali daftar produk/kuota berubah
  useEffect(() => {
    if (status === "siap") setItems(c => sesuaikanKeranjang(c, produk));
  }, [produk, status]);

  useEffect(() => { tulisAman(KUNCI.keranjang, items, isCart); }, [items]);

  // Ref agar beberapa "tambah" berturut-turut (mis. dari kalkulator) memakai keadaan terbaru
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const tambah = useCallback((p: Produk, jumlah = 1) => {
    const r = tambahKeKeranjang(itemsRef.current, p, jumlah);
    if (r.ditambah > 0) {
      itemsRef.current = r.cart;
      setItems(r.cart);
    }
    return r.ditambah;
  }, []);

  const nilai = useMemo<KeranjangCtx>(() => ({
    items, terbuka,
    total: totalKeranjang(items, produk),
    jumlah: jumlahItem(items),
    buka: () => setTerbuka(true),
    tutup: () => setTerbuka(false),
    tambah,
    atur: (p, j) => setItems(c => aturJumlah(c, p, j)),
    kosongkan: () => setItems([])
  }), [items, terbuka, produk, tambah]);

  return <Ctx.Provider value={nilai}>{children}</Ctx.Provider>;
}

export function useKeranjang(): KeranjangCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useKeranjang harus di dalam KeranjangProvider");
  return c;
}
