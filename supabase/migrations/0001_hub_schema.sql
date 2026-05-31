-- Shema Team Hub schema
-- Public access, no auth. RLS disabled for all hub_* tables.

create extension if not exists "pgcrypto";

-- ============================================================
-- hub_priorities
-- ============================================================
create table if not exists public.hub_priorities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  owner text,
  status text not null default 'open' check (status in ('open','in_progress','done')),
  priority int not null default 2 check (priority between 1 and 3),
  due_date date,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hub_priorities_status_idx on public.hub_priorities (status, position);

-- ============================================================
-- hub_pipeline (content kanban)
-- ============================================================
do $$ begin
  create type hub_pipeline_stage as enum ('idea','script','record','edit','review','posted');
exception when duplicate_object then null; end $$;

create table if not exists public.hub_pipeline (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  owner text,
  editor text,
  platform text,
  stage hub_pipeline_stage not null default 'idea',
  hook text,
  asset_url text,
  due_date date,
  posted_at timestamptz,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hub_pipeline_stage_idx on public.hub_pipeline (stage, position);

-- ============================================================
-- hub_eod (end-of-day reports)
-- ============================================================
create table if not exists public.hub_eod (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  report_date date not null default current_date,
  wins text,
  blockers text,
  tomorrow text,
  hours_worked numeric(4,1),
  mood text check (mood in ('green','yellow','red')),
  created_at timestamptz not null default now()
);
create index if not exists hub_eod_date_idx on public.hub_eod (report_date desc, created_at desc);
create index if not exists hub_eod_author_idx on public.hub_eod (author, report_date desc);

-- ============================================================
-- hub_sops (SOP library)
-- ============================================================
create table if not exists public.hub_sops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'general',
  body text not null default '',
  tags text[] default '{}',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hub_sops_category_idx on public.hub_sops (category, pinned desc, updated_at desc);
create index if not exists hub_sops_search_idx on public.hub_sops using gin (to_tsvector('english', title || ' ' || body));

-- ============================================================
-- hub_suggestions (improvement ideas)
-- ============================================================
create table if not exists public.hub_suggestions (
  id uuid primary key default gen_random_uuid(),
  author text,
  title text not null,
  body text,
  area text default 'general',
  status text not null default 'open' check (status in ('open','planned','shipped','wontfix')),
  upvotes int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists hub_suggestions_status_idx on public.hub_suggestions (status, upvotes desc, created_at desc);

-- ============================================================
-- RLS off (no auth on the team hub)
-- ============================================================
alter table public.hub_priorities  disable row level security;
alter table public.hub_pipeline    disable row level security;
alter table public.hub_eod         disable row level security;
alter table public.hub_sops        disable row level security;
alter table public.hub_suggestions disable row level security;

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.hub_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists hub_priorities_touch on public.hub_priorities;
create trigger hub_priorities_touch before update on public.hub_priorities
  for each row execute function public.hub_touch_updated_at();

drop trigger if exists hub_pipeline_touch on public.hub_pipeline;
create trigger hub_pipeline_touch before update on public.hub_pipeline
  for each row execute function public.hub_touch_updated_at();

drop trigger if exists hub_sops_touch on public.hub_sops;
create trigger hub_sops_touch before update on public.hub_sops
  for each row execute function public.hub_touch_updated_at();
