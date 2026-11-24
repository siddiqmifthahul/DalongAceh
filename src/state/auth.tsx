import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { loginDemo, sesiDemoAktif, type HasilLogin } from "../lib/authDemo";
import { supabase } from "../services/supabase";
import { useData } from "./data";

type Peran = "tamu" | "demo" | "penjual";

interface AuthCtx {
  peran: Peran;
  memeriksa: boolean;
  email: string | null;
  masukPenjual: (email: string, password: string) => Promise<string | null>;
  masukDemo: (user: string, pass: string) => HasilLogin;
  keluar: () => Promise<void>;
  cekSesiDemo: () => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

async function apakahAdmin(s: Session | null): Promise<boolean> {
  if (!s || !supabase) return false;
  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", s.user.id).maybeSingle();
  return !error && Boolean(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { aktifkanDemo, akhiriDemo, mode } = useData();
  const [sesi, setSesi] = useState<Session | null>(null);
  const [admin, setAdmin] = useState(false);
  const [memeriksa, setMemeriksa] = useState(Boolean(supabase));
  const [demo, setDemo] = useState(() => sesiDemoAktif());

  useEffect(() => {
    if (!supabase) return;
    let aktif = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const ok = await apakahAdmin(data.session);
      if (!aktif) return;
      setSesi(data.session); setAdmin(ok); setMemeriksa(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSesi(s);
      void apakahAdmin(s).then(ok => aktif && setAdmin(ok));
    });
    return () => { aktif = false; sub.subscription.unsubscribe(); };
  }, []);

  const masukPenjual = useCallback(async (email: string, password: string) => {
    if (!supabase) return "Database belum tersambung. Gunakan mode demo.";
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return "Email atau password salah.";
    if (!(await apakahAdmin(data.session))) {
      await supabase.auth.signOut();
      return "Akun ini bukan akun penjual.";
    }
    setAdmin(true);
    return null;
  }, []);

  const masukDemo = useCallback((user: string, pass: string) => {
    const r = loginDemo(user, pass);
    if (r.ok) { setDemo(true); aktifkanDemo(); }
    return r;
  }, [aktifkanDemo]);

  const keluar = useCallback(async () => {
    if (demo) { setDemo(false); akhiriDemo(); }
    if (supabase && sesi) await supabase.auth.signOut();
    setAdmin(false);
  }, [demo, sesi, akhiriDemo]);

  const cekSesiDemo = useCallback(() => {
    const ok = sesiDemoAktif();
    if (!ok && demo) { setDemo(false); akhiriDemo(); }
    return ok;
  }, [demo, akhiriDemo]);

  const peran: Peran = demo && mode === "demo" ? "demo" : admin ? "penjual" : "tamu";

  const nilai = useMemo<AuthCtx>(() => ({
    peran, memeriksa, email: sesi?.user.email ?? null, masukPenjual, masukDemo, keluar, cekSesiDemo
  }), [peran, memeriksa, sesi, masukPenjual, masukDemo, keluar, cekSesiDemo]);

  return <Ctx.Provider value={nilai}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth harus di dalam AuthProvider");
  return c;
}
