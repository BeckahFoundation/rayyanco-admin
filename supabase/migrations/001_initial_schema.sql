-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  description text,
  price numeric(10,2) not null default 0,
  sale_price numeric(10,2),
  category_id uuid references categories(id) on delete set null,
  image_url text,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  status text not null default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled')),
  notes text,
  total_amount numeric(10,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- Auto-generate order number
create or replace function generate_order_number()
returns trigger as $$
begin
  new.order_number = 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random()*10000)::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger orders_number before insert on orders
  for each row execute function generate_order_number();

-- Seed categories
insert into categories (name) values
  ('Sauna Heaters'),('Sauna Rocks'),('Benches & Wood'),('Sauna Doors'),
  ('Lighting'),('Ventilation'),('Accessories'),('Controls & Thermostats');

-- Storage bucket (run via Supabase dashboard or CLI)
-- insert into storage.buckets (id, name, public) values ('products', 'products', true);

-- RLS Policies (storage)
-- All product images are public read
-- Only authenticated admins can write

-- Enable RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table categories enable row level security;

-- Public read for products and categories (for catalog display)
create policy "Public read products" on products for select using (true);
create policy "Public read categories" on categories for select using (true);

-- Authenticated users (admins) can do everything
create policy "Admin all products" on products for all using (auth.role() = 'authenticated');
create policy "Admin all categories" on categories for all using (auth.role() = 'authenticated');
create policy "Admin all orders" on orders for all using (auth.role() = 'authenticated');
create policy "Admin all order_items" on order_items for all using (auth.role() = 'authenticated');
