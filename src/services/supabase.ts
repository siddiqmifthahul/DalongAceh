import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { kunciAman, urlSupabaseValid } from "../lib/kunci";

/** Nilai diambil dari environment variable (Vercel / .env.local), bukan ditulis di kode. */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const kunci = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Hanya kunci publik (anon/publishable) yang boleh ada di frontend. Kunci secret/service_role ditolak. */
export const supabaseTersedia = Boolean(url && kunci && urlSupabaseValid(url) && kunciAman(kunci));

if (url && kunci && !supabaseTersedia) {
  console.error("[supabase] Konfigurasi tidak valid atau memakai kunci rahasia. Website berjalan di mode demo.");
}

export const supabase: SupabaseClient | null = supabaseTersedia
  ? createClient(url!, kunci!, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "mk:v1:auth" } })
  : null;
