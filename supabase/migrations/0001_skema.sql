-- =====================================================================
-- Dapur Mak Ti: Pre-order Meugang & Kenduri
-- Skema database + Row Level Security (RLS)
-- Jalankan sekali di Supabase: SQL Editor > New query > tempel > Run
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- ADMIN ----------
-- Hanya user yang terdaftar di tabel ini yang dianggap penjual/admin.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- PRODUK ----------
create table if not exists public.produk (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null check (char_length(nama) between 3 and 60 and nama !~ '[<>]'),
  kategori   text not null check (kategori in ('daging','masakan','kue')),
  satuan     text not null check (satuan in ('kg','paket','kotak')),
  harga      integer not null check (harga between 1000 and 50000000),
  deskripsi  text not null check (char_length(deskripsi) between 10 and 150 and deskripsi !~ '[<>]'),
  ciri       text[] not null default '{}' check (cardinality(ciri) <= 3),
  foto       text check (foto is null or foto ~ '^(/img/[a-z0-9-]+\.(jpg|webp|png)|https://[^\s<>"'']+)$'),
  fokus      text not null default '50% 50%' check (fokus ~ '^\d{1,3}% \d{1,3}%$'),
  momen      text[] not null check (cardinality(momen) between 1 and 2 and momen <@ array['meugang','kenduri']::text[]),
  kuota      integer not null check (kuota between 0 and 10000),
  terpesan   integer not null default 0 check (terpesan >= 0 and terpesan <= kuota),
  aktif      boolean not null default true,
  urutan     integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PENGATURAN (satu baris) ----------
create table if not exists public.pengaturan (
  id          integer primary key default 1 check (id = 1),
  nama_usaha  text not null check (char_length(nama_usaha) between 2 and 60 and nama_usaha !~ '[<>]'),
  no_whatsapp text not null check (no_whatsapp ~ '^628\d{7,12}$'),
  momen_label text not null check (char_length(momen_label) between 2 and 60 and momen_label !~ '[<>]'),
  po_tutup    timestamptz not null,
  slots       text[] not null check (cardinality(slots) between 1 and 12)
);

-- ---------- PESANAN ----------
create table if not exists public.pesanan (
  kode       text primary key check (kode ~ '^MK-[A-HJ-NP-Z2-9]{8}$'),
  created_at timestamptz not null default now(),
  sumber     text not null default 'web' check (sumber in ('web','manual')),
  nama       text not null check (char_length(nama) between 2 and 50 and nama !~ '[<>]'),
  no_hp      text not null check (no_hp ~ '^628\d{7,12}$'),
  metode     text not null check (metode in ('ambil','antar')),
  alamat     text check (alamat is null or (char_length(alamat) between 10 and 200 and alamat !~ '[<>]')),
  slot       text not null check (char_length(slot) between 1 and 80),
  catatan    text check (catatan is null or (char_length(catatan) <= 200 and catatan !~ '[<>]')),
  status     text not null default 'baru' check (status in ('baru','dp','lunas','diambil','batal')),
  total      integer not null default 0 check (total >= 0)
);
create index if not exists pesanan_no_hp_waktu on public.pesanan (no_hp, created_at desc);

create table if not exists public.pesanan_item (
  id           bigint generated always as identity primary key,
  kode         text not null references public.pesanan(kode) on delete cascade,
  produk_id    uuid references public.produk(id) on delete set null,
  nama         text not null,
  jumlah       integer not null check (jumlah between 1 and 1000),
  harga_satuan integer not null check (harga_satuan >= 0),
  satuan       text not null check (satuan in ('kg','paket','kotak'))
);
create index if not exists pesanan_item_kode on public.pesanan_item (kode);

-- =====================================================================
-- ROW LEVEL SECURITY: semua tabel dikunci, lalu dibuka seperlunya
-- =====================================================================
alter table public.admins       enable row level security;
alter table public.produk       enable row level security;
alter table public.pengaturan   enable row level security;
alter table public.pesanan      enable row level security;
alter table public.pesanan_item enable row level security;

drop policy if exists "admin lihat diri sendiri" on public.admins;
create policy "admin lihat diri sendiri" on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists "publik lihat produk aktif" on public.produk;
create policy "publik lihat produk aktif" on public.produk for select to anon, authenticated using (aktif or public.is_admin());
drop policy if exists "admin tambah produk" on public.produk;
create policy "admin tambah produk" on public.produk for insert to authenticated with check (public.is_admin());
drop policy if exists "admin ubah produk" on public.produk;
create policy "admin ubah produk" on public.produk for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin hapus produk" on public.produk;
create policy "admin hapus produk" on public.produk for delete to authenticated using (public.is_admin());

drop policy if exists "publik lihat pengaturan" on public.pengaturan;
create policy "publik lihat pengaturan" on public.pengaturan for select to anon, authenticated using (true);
drop policy if exists "admin ubah pengaturan" on public.pengaturan;
create policy "admin ubah pengaturan" on public.pengaturan for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Pesanan: pembeli TIDAK bisa membaca/menulis tabel langsung (hanya lewat fungsi di bawah).
drop policy if exists "admin kelola pesanan" on public.pesanan;
create policy "admin kelola pesanan" on public.pesanan for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin kelola item" on public.pesanan_item;
create policy "admin kelola item" on public.pesanan_item for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- FUNGSI: buat pesanan (cek kuota & PO di server, atomik, anti-spam)
-- =====================================================================
create or replace function public.buat_pesanan(
  p_nama text, p_no_hp text, p_metode text, p_alamat text, p_slot text, p_catatan text, p_items jsonb
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_set     public.pengaturan%rowtype;
  v_kode    text;
  v_total   integer := 0;
  v_prod    public.produk%rowtype;
  v_jumlah  integer;
  v_item    record;
  alfabet   constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i         integer;
begin
  select * into v_set from public.pengaturan where id = 1;
  if not found then raise exception 'Toko belum siap menerima pesanan'; end if;
  if now() > v_set.po_tutup then raise exception 'PO sudah ditutup'; end if;
  if p_slot is null or not (p_slot = any (v_set.slots)) then raise exception 'Jam ambil tidak valid'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'Isi pesanan tidak valid';
  end if;

  -- anti-spam: maks. 5 pesanan per nomor per jam, dan maks. 60 pesanan per menit untuk seluruh toko
  if (select count(*) from public.pesanan where no_hp = p_no_hp and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Terlalu banyak pesanan dari nomor ini. Coba lagi satu jam lagi.';
  end if;
  if (select count(*) from public.pesanan where created_at > now() - interval '1 minute') >= 60 then
    raise exception 'Sedang banyak pesanan. Coba lagi sebentar.';
  end if;

  loop
    v_kode := 'MK-';
    for i in 1..8 loop
      v_kode := v_kode || substr(alfabet, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % 32), 1);
    end loop;
    exit when not exists (select 1 from public.pesanan where kode = v_kode);
  end loop;

  insert into public.pesanan (kode, nama, no_hp, metode, alamat, slot, catatan)
  values (v_kode, btrim(p_nama), p_no_hp, p_metode,
          case when p_metode = 'antar' then nullif(btrim(p_alamat), '') end,
          p_slot, nullif(btrim(p_catatan), ''));

  -- kunci baris produk berurutan (menghindari deadlock), lalu cek & kurangi kuota
  for v_item in
    select (e->>'produk_id')::uuid as produk_id, sum((e->>'jumlah')::integer) as jumlah
    from jsonb_array_elements(p_items) e
    group by 1 order by 1
  loop
    v_jumlah := v_item.jumlah;
    select * into v_prod from public.produk where id = v_item.produk_id and aktif for update;
    if not found then raise exception 'Ada produk yang sudah tidak tersedia'; end if;
    if v_jumlah is null or v_jumlah < 1 or v_prod.terpesan + v_jumlah > v_prod.kuota then
      raise exception 'Kuota % tidak cukup (sisa %)', v_prod.nama, v_prod.kuota - v_prod.terpesan;
    end if;
    update public.produk set terpesan = terpesan + v_jumlah where id = v_prod.id;
    insert into public.pesanan_item (kode, produk_id, nama, jumlah, harga_satuan, satuan)
    values (v_kode, v_prod.id, v_prod.nama, v_jumlah, v_prod.harga, v_prod.satuan);
    v_total := v_total + v_jumlah * v_prod.harga;
  end loop;

  update public.pesanan set total = v_total where kode = v_kode;
  return v_kode;
end $$;

revoke all on function public.buat_pesanan(text,text,text,text,text,text,jsonb) from public;
grant execute on function public.buat_pesanan(text,text,text,text,text,text,jsonb) to anon, authenticated;

-- =====================================================================
-- FUNGSI: cek pesanan untuk pembeli (butuh kode + 4 digit terakhir no. HP)
-- Tidak mengembalikan nama / nomor HP (privasi).
-- =====================================================================
create or replace function public.cek_pesanan(p_kode text, p_hp4 text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'kode', p.kode, 'status', p.status, 'metode', p.metode, 'slot', p.slot, 'total', p.total,
    'items', coalesce((select jsonb_agg(jsonb_build_object('nama', i.nama, 'jumlah', i.jumlah, 'satuan', i.satuan) order by i.id)
                       from public.pesanan_item i where i.kode = p.kode), '[]'::jsonb))
  from public.pesanan p
  where p.kode = upper(p_kode) and p_hp4 ~ '^\d{4}$' and right(p.no_hp, 4) = p_hp4;
$$;
revoke all on function public.cek_pesanan(text,text) from public;
grant execute on function public.cek_pesanan(text,text) to anon, authenticated;

-- =====================================================================
-- TRIGGER: status Batal mengembalikan kuota; diaktifkan lagi mengambil kuota
-- =====================================================================
create or replace function public.atur_kuota_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_item record;
begin
  if new.status = 'batal' and old.status <> 'batal' then
    update public.produk p set terpesan = greatest(0, p.terpesan - i.jumlah)
    from public.pesanan_item i where i.kode = new.kode and i.produk_id = p.id;
  elsif old.status = 'batal' and new.status <> 'batal' then
    for v_item in select produk_id, jumlah, nama from public.pesanan_item where kode = new.kode and produk_id is not null order by produk_id loop
      update public.produk set terpesan = terpesan + v_item.jumlah
      where id = v_item.produk_id and terpesan + v_item.jumlah <= kuota;
      if not found then raise exception 'Kuota % tidak cukup untuk mengaktifkan lagi pesanan ini', v_item.nama; end if;
    end loop;
  end if;
  return new;
end $$;

drop trigger if exists pesanan_status_kuota on public.pesanan;
create trigger pesanan_status_kuota after update of status on public.pesanan
for each row when (old.status is distinct from new.status) execute function public.atur_kuota_status();

create or replace function public.sentuh_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists produk_updated_at on public.produk;
create trigger produk_updated_at before update on public.produk for each row execute function public.sentuh_updated_at();

-- =====================================================================
-- STORAGE: foto produk (publik dibaca, hanya admin yang menulis)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto-produk', 'foto-produk', true, 1048576, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/webp','image/jpeg','image/png'];

drop policy if exists "admin unggah foto" on storage.objects;
create policy "admin unggah foto" on storage.objects for insert to authenticated with check (bucket_id = 'foto-produk' and public.is_admin());
drop policy if exists "admin ubah foto" on storage.objects;
create policy "admin ubah foto" on storage.objects for update to authenticated using (bucket_id = 'foto-produk' and public.is_admin());
drop policy if exists "admin hapus foto" on storage.objects;
create policy "admin hapus foto" on storage.objects for delete to authenticated using (bucket_id = 'foto-produk' and public.is_admin());
