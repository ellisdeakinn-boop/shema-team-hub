-- SOPs are now external links (Google Docs, Notion, Drive, etc.)
-- Adds url column. Existing body content stays as fallback notes.

alter table public.hub_sops
  add column if not exists url text;

-- body was 'not null default ""' previously — relax to nullable so new SOPs
-- can be url-only.
alter table public.hub_sops
  alter column body drop not null,
  alter column body drop default;

create index if not exists hub_sops_url_idx on public.hub_sops (url) where url is not null;
