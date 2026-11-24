import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

const ToastCtx = createContext<(pesan: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [pesan, setPesan] = useState("");
  const [tampil, setTampil] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const tunjukkan = useCallback((p: string) => {
    setPesan(p);
    setTampil(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTampil(false), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={tunjukkan}>
      {children}
      <div className={"toast" + (tampil ? " show" : "")} role="status" aria-live="polite">{pesan}</div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
