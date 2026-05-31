# Shema Team Hub

Internal team hub for Shema's team — dashboard, priorities, content pipeline, EOD reports, SOP library, and suggestions box.

Built for Elevate Operations.

## Stack

- **Frontend** Next.js 16 (App Router) + Tailwind v4 + TypeScript
- **Database** Supabase (Postgres) — reuses the existing Shema project (`vlcquiskmptrvxieffnk`)
- **Auth** None — public hub, anyone with the URL can view and edit
- **Hosting** Vercel (planned: `team.shema.elevateoperations.info`)

## Sections

| Route | Purpose |
|---|---|
| `/` | Dashboard — open priorities, pipeline glance, recent EODs, top suggestions, quick links |
| `/priorities` | Weekly priorities — P1/P2/P3, owner, due date, open → in progress → done |
| `/pipeline` | Organic content kanban — idea → script → record → edit → review → posted (with views, engagement, follower delta, link clicks metrics) |
| `/pipeline?tab=ads` | Ad creatives kanban — concept → production → review → testing → scaling → killed (with static/dynamic type, format, full Meta metrics: spend, impressions, CPM, CTR, results, CPR, frequency) |
| `/eod` | End-of-day reports — wins / blockers / tomorrow / mood, filter by author |
| `/sops` | SOP library — categories, search, pin, full markdown body |
| `/suggestions` | Improvement ideas — upvote, status (open/planned/shipped/wontfix) |

## First-time setup

### 1. Install dependencies

```bash
cd shema-team-hub
npm install
```

### 2. Configure env

`.env.local` is already populated with the Shema Supabase keys (anon + service role). If you spin this up from scratch, copy `.env.example` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Apply the migrations

The hub uses 6 tables in the existing Shema Supabase project (all prefixed `hub_` so they don't collide with the funnel dashboard).

**One-time:** open the Supabase SQL editor and paste in the migrations + seeds, in order.

1. Go to <https://supabase.com/dashboard/project/vlcquiskmptrvxieffnk/sql/new>
2. Paste `supabase/migrations/0001_hub_schema.sql` and run.
3. Paste `supabase/migrations/0002_pipeline_split.sql` and run — this adds metrics columns to `hub_pipeline` (organic) and creates `hub_ads` (ad creatives pipeline).
4. (Optional, recommended for first run) Paste `supabase/seed.sql` and run.
5. (Optional) Paste `supabase/seed_ads.sql` and run for example ad cards.

This creates:

- `hub_priorities`
- `hub_pipeline` (organic content — with views/engagement/follower_delta/link_clicks metrics)
- `hub_ads` (ad creatives — static/dynamic, format, CPM/CTR/spend/results/CPR/frequency/impressions)
- `hub_eod`
- `hub_sops`
- `hub_suggestions`

All have RLS disabled because the hub has no auth.

### 4. Run locally

```bash
npm run dev
# http://localhost:3000
```

## Deployment (Vercel)

```bash
vercel link        # link to a new Vercel project
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

Add `team.shema.elevateoperations.info` (or similar) as a custom domain in the Vercel dashboard.

## Theming notes

Dark theme inspired by [frameworkcrtv.com](https://frameworkcrtv.com):

- Near-black background (`#0a0a0a`), surface (`#111111`), borders (`#232323`)
- Red accent `#ff2a2a` for active states and CTAs
- Inter font, bold tracking-tight headings
- Cards: minimal border, no heavy shadows
- Pulse-dot "live" indicator in the nav

All colors are defined as CSS variables in `src/app/globals.css` under the `@theme` block — change them once and the whole hub re-themes.

## File layout

```
src/app/
  layout.tsx                # root layout + nav
  page.tsx                  # dashboard
  globals.css               # theme tokens
  _components/
    nav.tsx                 # sticky top nav
    ui.tsx                  # Button/Input/Card/Badge/Empty primitives
  lib/
    supabase.ts             # supabasePublic + supabaseServer (service role)
    cn.ts
  priorities/
    page.tsx
    actions.ts              # server actions: create/update/delete
  pipeline/
    page.tsx
    actions.ts              # create/move/setStage/delete/updateField
    _components/
      card-actions.tsx      # client-side mover + edit modal
  eod/
    page.tsx
    actions.ts
  sops/
    page.tsx                # list + new
    [id]/page.tsx           # detail + edit + delete + pin
    actions.ts
  suggestions/
    page.tsx
    actions.ts              # create/upvote/setStatus/delete

supabase/
  migrations/0001_hub_schema.sql   # tables + indexes + triggers
  seed.sql                          # idempotent seed data
```

## Adding more sections later

The pattern is consistent — each section is one folder with `page.tsx` + `actions.ts`:

1. Add a `hub_<name>` table to a new migration file.
2. Create `src/app/<name>/page.tsx` and `actions.ts`.
3. Add an entry to the `LINKS` array in `src/app/_components/nav.tsx`.
4. (Optional) Surface a stat tile + recent items on the dashboard in `src/app/page.tsx`.
