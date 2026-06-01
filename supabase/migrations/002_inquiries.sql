-- Customer inquiries from public catalog "Request Pricing" form.
-- Anonymous visitors can INSERT only; authenticated admins can do everything.

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text,
  name text not null,
  email text not null,
  phone text,
  company text,
  quantity text,
  message text,
  status text not null default 'new' check (status in ('new','contacted','quoted','closed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inquiries_status_idx on inquiries(status);
create index if not exists inquiries_created_at_idx on inquiries(created_at desc);

alter table inquiries enable row level security;

-- Public visitors (anon role) may submit inquiries
drop policy if exists "anon can insert inquiries" on inquiries;
create policy "anon can insert inquiries" on inquiries
  for insert to anon with check (true);

-- Authenticated admins have full access
drop policy if exists "auth full access on inquiries" on inquiries;
create policy "auth full access on inquiries" on inquiries
  for all to authenticated using (true) with check (true);

-- Auto-update updated_at on row change
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists inquiries_updated_at on inquiries;
create trigger inquiries_updated_at before update on inquiries
  for each row execute function set_updated_at();
