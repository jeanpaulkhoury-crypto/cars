-- DriveVault production database schema (PostgreSQL/Supabase-ready)
create table if not exists profiles (
  id uuid primary key,
  name text not null,
  email text unique not null,
  role text not null default 'user' check (role in ('user','admin'))
);

create table if not exists cars (
  id bigint generated always as identity primary key,
  make text not null,
  model text not null,
  year int not null check (year between 1886 and 2100),
  price numeric(14,2) not null check (price >= 0),
  mileage int not null default 0 check (mileage >= 0),
  fuel text not null,
  trans text not null,
  engine text,
  hp int,
  drive text,
  color text,
  location text,
  seller_id uuid references profiles(id),
  seller_name text,
  image text,
  description text,
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active','sold','pending','removed')),
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  car_id bigint not null references cars(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,car_id)
);

create table if not exists inquiries (
  id bigint generated always as identity primary key,
  car_id bigint not null references cars(id) on delete cascade,
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  message text not null,
  created_at timestamptz not null default now(),
  status text not null default 'new'
);

create index if not exists cars_make_idx on cars(make);
create index if not exists cars_price_idx on cars(price);
create index if not exists cars_status_idx on cars(status);
