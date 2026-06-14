-- Jalankan di Supabase SQL Editor kalau tabel profile kamu belum punya field kontak ini.
alter table public.profile
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

-- Isi data kontak awal dari data lama, aman kalau sudah pernah ada.
update public.profile
set
  contact_email = coalesce(contact_email, 'fathirafifm@gmail.com'),
  contact_phone = coalesce(contact_phone, '083151960290')
where contact_email is null or contact_phone is null;
