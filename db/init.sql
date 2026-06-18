create table if not exists financial_profiles (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists goals (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists conversation_messages (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists model_experiments (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists paper_orders (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
