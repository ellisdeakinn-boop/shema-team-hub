-- Split content pipeline into Organic + Ads
-- Adds metrics to hub_pipeline (organic) and creates hub_ads.

-- ============================================================
-- Organic metrics on hub_pipeline
-- ============================================================
alter table public.hub_pipeline
  add column if not exists views          int,
  add column if not exists engagement     int,
  add column if not exists follower_delta int,
  add column if not exists link_clicks    int,
  add column if not exists metrics_updated_at timestamptz;

-- ============================================================
-- hub_ads (ad creatives pipeline)
-- ============================================================
do $$ begin
  create type hub_ad_stage as enum ('concept','production','review','testing','scaling','killed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hub_ad_type as enum ('static','dynamic');
exception when duplicate_object then null; end $$;

create table if not exists public.hub_ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  owner text,
  editor text,
  platform text,                          -- e.g. Meta, TikTok Ads, YouTube Ads
  hook text,
  asset_url text,                         -- Drive / Frame.io link
  ad_set text,                            -- e.g. "Cold AU 25-45 Lookalike"
  campaign text,                          -- campaign name
  stage hub_ad_stage not null default 'concept',
  creative_type hub_ad_type,              -- static (image/graphic) or dynamic (video)
  format text,                            -- 1:1, 9:16, 4:5, 16:9, carousel, story, reel
  -- metrics (user-specified set)
  cpm numeric(10,2),
  ctr numeric(6,3),                       -- store as percent, e.g. 1.234 = 1.234%
  amount_spent numeric(12,2),
  results int,
  cost_per_result numeric(10,2),
  frequency numeric(6,2),
  impressions bigint,
  metrics_updated_at timestamptz,
  due_date date,
  launched_at timestamptz,                -- went live
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hub_ads_stage_idx on public.hub_ads (stage, position);
create index if not exists hub_ads_type_idx on public.hub_ads (creative_type);

-- RLS off (no auth)
alter table public.hub_ads disable row level security;

-- updated_at trigger
drop trigger if exists hub_ads_touch on public.hub_ads;
create trigger hub_ads_touch before update on public.hub_ads
  for each row execute function public.hub_touch_updated_at();
