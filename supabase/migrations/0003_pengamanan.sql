-- =====================================================================
-- 0003: Pengamanan berdasarkan temuan Security Advisor Supabase (OWASP A01/A05)
-- Jalankan setelah 0001 dan 0002. Aman dijalankan ulang.
-- =====================================================================

-- 1) Fungsi pengecek admin dipindah ke skema "private" yang TIDAK diekspos lewat API.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- 2) Semua policy memakai private.is_admin(). Pengunjung tanpa login (anon) tidak memanggil fungsi apa pun.
drop policy if exists "publik lihat produk aktif" on public.produk;
create policy "publik lihat produk aktif" on public.produk for select to anon using (aktif);
drop policy if exists "pengguna lihat produk" on public.produk;
create policy "pengguna lihat produk" on public.produk for select to authenticated using (aktif or private.is_admin());
drop policy if exists "admin tambah produk" on public.produk;
create policy "admin tambah produk" on public.produk for insert to authenticated with check (private.is_admin());
drop policy if exists "admin ubah produk" on public.produk;
create policy "admin ubah produk" on public.produk for update to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admin hapus produk" on public.produk;
create policy "admin hapus produk" on public.produk for delete to authenticated using (private.is_admin());

drop policy if exists "admin ubah pengaturan" on public.pengaturan;
create policy "admin ubah pengaturan" on public.pengaturan for update to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "admin kelola pesanan" on public.pesanan;
create policy "admin kelola pesanan" on public.pesanan for all to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admin kelola item" on public.pesanan_item;
create policy "admin kelola item" on public.pesanan_item for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "admin unggah foto" on storage.objects;
create policy "admin unggah foto" on storage.objects for insert to authenticated with check (bucket_id = 'foto-produk' and private.is_admin());
drop policy if exists "admin ubah foto" on storage.objects;
create policy "admin ubah foto" on storage.objects for update to authenticated using (bucket_id = 'foto-produk' and private.is_admin());
drop policy if exists "admin hapus foto" on storage.objects;
create policy "admin hapus foto" on storage.objects for delete to authenticated using (bucket_id = 'foto-produk' and private.is_admin());

-- Fungsi lama di skema public tidak dipakai lagi.
drop function if exists public.is_admin();

-- 3) Fungsi trigger tidak boleh dipanggil siapa pun lewat API, dan search_path dikunci.
alter function public.sentuh_updated_at() set search_path = '';
revoke execute on function public.sentuh_updated_at() from public, anon, authenticated;
revoke execute on function public.atur_kuota_status() from public, anon, authenticated;
do $$
begin
  -- dibuat otomatis oleh Supabase (opsi "Enable RLS on new tables automatically")
  if exists (select 1 from pg_proc where proname = 'rls_auto_enable' and pronamespace = 'public'::regnamespace) then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

-- 4) buat_pesanan & cek_pesanan SENGAJA tetap bisa dipanggil publik (pembeli memesan tanpa akun).
--    Keduanya security definer dengan validasi ketat di dalam fungsi; dicatat sebagai risiko diterima
--    di docs/SECURITY-REVIEW.md.
