import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const kunci = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Hanya kunci publik (anon/publishable) yang boleh ada di frontend. Kunci secret/service_role ditolak. */
function kunciAman(k: string): boolean {
  if (k.startsWith("sb_secret_")) return false;
  if (k.split(".").length === 3) {
    try {
      const isi = JSON.parse(atob(k.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (isi.role === "service_role") return false;
    } catch { /* bukan JWT yang bisa dibaca: biarkan Supabase yang menolak */ }
  }
  return true;
}

export const supabaseTersedia = Boolean(url && kunci && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) && kunciAman(kunci));

if (url && kunci && !supabaseTersedia) {
  console.error("[supabase] Konfigurasi tidak valid atau memakai kunci rahasia. Website berjalan di mode demo.");
}

export const supabase: SupabaseClient | null = supabaseTersedia
  ? createClient(url!, kunci!, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "mk:v1:auth" } })
  : null;
