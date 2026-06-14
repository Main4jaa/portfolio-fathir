# Supabase setup

## 1. Environment
Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://ralbhckvsixcdwpzyxpc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=ISI_PUBLISHABLE_KEY_KAMU
```

## 2. Storage
Bucket yang dipakai: `portfolio`
Public bucket: ON

## 3. Tambahan kolom kontak
Karena admin sekarang bisa mengatur email, nomor, GitHub, LinkedIn, dan Instagram, jalankan file ini di Supabase SQL Editor:

```sql
alter table public.profile
  add column if not exists contact_email text,
  add column if not exists contact_phone text;
```

Atau langsung copy isi file:

```txt
supabase/profile-contact-migration.sql
```

## 4. Halaman
Public portfolio:

```txt
http://localhost:5173/
```

Admin:

```txt
http://localhost:5173/admin
```

## 5. Catatan
- Contact card di halaman public cuma muncul kalau field-nya diisi di admin.
- Kalau LinkedIn/Instagram kosong, kotaknya otomatis hilang.
- Upload foto profile sekarang langsung disimpan ke database.
- Project tersimpan ada di bagian bawah admin.
- Kalau database project masih kosong, project bawaan akan tampil di admin dengan tombol `Simpan ke DB`.
