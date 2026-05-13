create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text unique,
  name text,
  patch_contact_id text,
  roller_customer_id text,
  home_park_id text,
  home_park_name text,
  loyalty_points integer not null default 0,
  loyalty_target integer,
  pending boolean not null default false,
  waiver_status text,
  waiver_signed_at timestamptz,
  waiver_expiry_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_email_or_phone_required check (email is not null or phone is not null)
);
create unique index if not exists customers_phone_key on customers(phone);

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
  provider_event_id text,
  event_date timestamptz,
  send_date timestamptz,
  attempted_at timestamptz not null default now(),
  received_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null unique,
  customer_id uuid references customers(id),
  booking_reference text,
  roller_customer_id text,
  park_id text,
  park_name text,
  source text,
  channel text,
  booking_date date,
  booking_end_date date,
  starts_at timestamptz,
  ticket_count integer,
  status text,
  last_event_type text,
  last_event_date timestamptz,
  provider_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  code text not null unique,
  is_used boolean not null default false,
  issued_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists otp_codes_email_idx on otp_codes(email);
create index if not exists webhook_events_type_received_at_idx on webhook_events(type, received_at);
create index if not exists bookings_customer_id_idx on bookings(customer_id);
create index if not exists bookings_roller_customer_id_idx on bookings(roller_customer_id);
create index if not exists discount_codes_customer_used_idx on discount_codes(customer_id, is_used);
