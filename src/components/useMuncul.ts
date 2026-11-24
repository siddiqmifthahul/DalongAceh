import { useCallback, useRef } from "react";

/**
 * Menambahkan kelas `is-terlihat` satu kali saat elemen masuk layar, untuk memicu animasi CSS.
 * Jika gerak dimatikan (kelas `gerak` tidak ada di <html>), kelas langsung ditambahkan sehingga konten
 * selalu tampil. Memakai callback ref supaya tetap bekerja untuk elemen yang baru muncul setelah data dimuat.
 */
export function useMuncul<T extends Element>(ambang = 0.12) {
  const lepas = useRef<(() => void) | null>(null);
  return useCallback((el: T | null) => {
    lepas.current?.();
    lepas.current = null;
    if (!el) return;
    if (!document.documentElement.classList.contains("gerak") || !("IntersectionObserver" in window)) {
      el.classList.add("is-terlihat");
      return;
    }
    const obs = new IntersectionObserver(entri => {
      if (entri.some(e => e.isIntersecting)) { el.classList.add("is-terlihat"); obs.disconnect(); }
    }, { threshold: ambang, rootMargin: "0px 0px -8% 0px" });
    obs.observe(el);
    lepas.current = () => obs.disconnect();
  }, [ambang]);
}
