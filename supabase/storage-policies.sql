-- Jalankan ini di Supabase SQL Editor kalau upload gambar dari /admin error karena policy storage.
-- Bucket yang dipakai: portfolio

create policy "Public can read portfolio bucket"
on storage.objects
for select
using (bucket_id = 'portfolio');

create policy "Authenticated can upload portfolio files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portfolio');

create policy "Authenticated can update portfolio files"
on storage.objects
for update
to authenticated
using (bucket_id = 'portfolio')
with check (bucket_id = 'portfolio');

create policy "Authenticated can delete portfolio files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portfolio');
