create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  patch_contact_id text,
  roller_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create table if not exists loyalty_snapshots (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  loyalty_points integer not null default 0,
  loyalty_target integer,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

create table if not exists account_projection (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references customers(id),
  profile_json jsonb not null default '{}'::jsonb,
  bookings_json jsonb not null default '[]'::jsonb,
  waivers_json jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  code text not null unique,
  status text not null check (status in ('active', 'used', 'expired', 'invalid')),
  payload jsonb not null default '{}'::jsonb,
  issued_at timestamptz not null default now(),
  used_at timestamptz
);

create table if not exists used_discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  payload jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now()
);

create index if not exists otp_codes_email_idx on otp_codes(email);
create index if not exists webhook_events_type_received_at_idx on webhook_events(type, received_at);
create index if not exists loyalty_snapshots_customer_received_at_idx on loyalty_snapshots(customer_id, received_at desc);
create index if not exists account_projection_customer_id_idx on account_projection(customer_id);
create index if not exists discount_codes_customer_status_idx on discount_codes(customer_id, status);
