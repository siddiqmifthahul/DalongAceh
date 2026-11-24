-- Data awal: pengaturan toko + 8 produk (harga & kuota = contoh, silakan diubah dari dasbor)
insert into public.pengaturan (id, nama_usaha, no_whatsapp, momen_label, po_tutup, slots)
values (1, 'Dalong Aceh', '6282261451487', 'Meugang Ramadan 2027', '2027-02-05 18:00:00+07',
        array['Sabtu, 6 Feb 2027, 05.30–07.30', 'Sabtu, 6 Feb 2027, 07.30–09.30', 'Minggu, 7 Feb 2027, 05.30–07.30'])
on conflict (id) do nothing;

insert into public.produk (urutan, nama, kategori, satuan, harga, kuota, terpesan, momen, foto, fokus, ciri, deskripsi)
select * from (values
  (1, 'Daging Sapi Meugang', 'daging', 'kg', 180000, 100, 0, array['meugang'], '/img/sapi.jpg', '50% 38%', array['Segar','Lokal','Dipotong subuh'],
   'Daging sapi lokal dipotong subuh sehari sebelum Meugang. Bisa minta dipotong kecil untuk sie masak.'),
  (2, 'Daging Kerbau Meugang', 'daging', 'kg', 190000, 60, 0, array['meugang'], '/img/kerbau.jpg', '50% 55%', array['Segar','Lokal','Favorit Meugang'],
   'Daging kerbau segar, pilihan banyak keluarga untuk masak Meugang. Ditimbang di hari pengambilan.'),
  (3, 'Sie Reuboh', 'daging', 'kg', 220000, 30, 0, array['meugang'], '/img/reuboh.jpg', '40% 40%', array['Gurih','Asam segar','Tahan lama'],
   'Daging rebus khas Aceh Besar dengan cuka dan lemak. Tahan beberapa hari, tinggal dipanaskan.'),
  (4, 'Paket Kuah Beulangong (50 porsi)', 'masakan', 'paket', 2500000, 8, 0, array['kenduri'], '/img/beulangong.jpg', '50% 40%', array['Berempah','Nangka muda','50 porsi'],
   'Gulai daging dan nangka muda yang dimasak dalam kuali besar. Cukup untuk sekitar 50 tamu kenduri.'),
  (5, 'Paket Kari Kambing Aceh (50 porsi)', 'masakan', 'paket', 2800000, 6, 0, array['kenduri'], '/img/kari.jpg', '50% 60%', array['Berempah','Gongseng','50 porsi'],
   'Kari kambing berempah dengan kelapa gongseng. Dimasak pagi hari dan diantar hangat ke lokasi.'),
  (6, 'Timphan (isi 50)', 'kue', 'kotak', 150000, 40, 0, array['meugang','kenduri'], '/img/timphan.jpg', '50% 50%', array['Lembut','Manis','Daun pisang'],
   'Kue berbungkus daun pisang, isi srikaya atau kelapa. Suguhan wajib saat Lebaran dan kenduri.'),
  (7, 'Kue Bhoi (isi 50)', 'kue', 'kotak', 125000, 40, 0, array['meugang','kenduri'], '/img/bhoi.jpg', '50% 45%', array['Renyah','Manis','Hantaran'],
   'Bolu kering berbentuk ikan dan bunga, biasa dibawa sebagai hantaran. Renyah di luar, lembut di dalam.'),
  (8, 'Keukarah (1 kotak)', 'kue', 'kotak', 60000, 50, 0, array['meugang','kenduri'], '/img/keukarah.jpg', '50% 50%', array['Renyah','Manis','Suguhan tamu'],
   'Kue jaring dari tepung beras yang renyah dan manis. Dikemas rapi dalam kotak untuk suguhan tamu.')
) as v(urutan, nama, kategori, satuan, harga, kuota, terpesan, momen, foto, fokus, ciri, deskripsi)
where not exists (select 1 from public.produk);
