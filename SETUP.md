# Rayyanco LLC — Admin Setup Guide

## 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Copy your **service_role key** (keep secret)

### Run the migration

In Supabase → SQL Editor, paste and run `supabase/migrations/001_initial_schema.sql`

### Create Storage Bucket

In Supabase → Storage → New bucket:
- Name: `products`
- Public: ✅ (checked)

Then add this policy for authenticated uploads:
```sql
-- Allow authenticated users to upload
create policy "Authenticated upload" on storage.objects
  for insert with check (bucket_id = 'products' AND auth.role() = 'authenticated');

create policy "Public read" on storage.objects
  for select using (bucket_id = 'products');

create policy "Authenticated delete" on storage.objects
  for delete using (bucket_id = 'products' AND auth.role() = 'authenticated');
```

### Create Admin User

In Supabase → Authentication → Users → Add user:
- Email: your admin email
- Password: strong password

## 2. Local Development

```bash
cp .env.example .env.local
# Fill in your Supabase credentials

npm install
npm run dev
# Open http://localhost:3000
```

## 3. Deploy to Vercel via GitHub

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy → Done!

## Features

| Feature | Location |
|---------|----------|
| Admin login | `/login` |
| Dashboard overview | `/dashboard` |
| Product CRUD + images | `/products` |
| Order management | `/orders` |
| Inventory tracking | `/inventory` |
