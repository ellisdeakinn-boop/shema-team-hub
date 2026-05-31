import Link from "next/link";
import { supabaseServer } from "@/app/lib/supabase";
import { PageHeader, Card, Button, Input, Label, Badge, Empty } from "@/app/_components/ui";
import { createSop } from "./actions";

export const revalidate = 0;

type Sop = {
  id: string;
  title: string;
  url: string | null;
  category: string;
  body: string | null;
  tags: string[];
  pinned: boolean;
  updated_at: string;
};

type SearchParams = Promise<{ q?: string; category?: string }>;

function hostnameFromUrl(u: string | null): string | null {
  if (!u) return null;
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export default async function SopsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const sb = supabaseServer();
  let q = sb.from("hub_sops").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false });
  if (params.q) {
    const term = `%${params.q}%`;
    q = q.or(`title.ilike.${term},body.ilike.${term}`);
  }
  if (params.category) q = q.eq("category", params.category);
  const { data } = await q;
  const sops = (data ?? []) as Sop[];

  const { data: allCats } = await sb.from("hub_sops").select("category");
  const catSet = new Set((allCats ?? []).map((c: { category: string }) => c.category));
  const categories = Array.from(catSet).sort();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="05 · Knowledge"
        title="SOP Library"
        subtitle="Process docs and playbooks. Linked out to Google Docs, Notion, or wherever they live. Click any card to open."
        actions={
          <form className="flex items-center gap-2">
            <Input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search SOPs..."
              className="md:w-64"
            />
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        }
      />

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/sops"
            className={`px-3 py-1 text-xs rounded-full border ${!params.category ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "text-[var(--color-muted)] border-[var(--color-border)] hover:text-white"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/sops?category=${encodeURIComponent(c)}`}
              className={`px-3 py-1 text-xs rounded-full border ${params.category === c ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "text-[var(--color-muted)] border-[var(--color-border)] hover:text-white"}`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {/* New SOP */}
      <details className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[var(--color-surface-2)] flex items-center justify-between">
          <span>+ New SOP</span>
          <span className="text-xs text-[var(--color-muted)] normal-case">Click to expand</span>
        </summary>
        <div className="border-t border-[var(--color-border)] p-5">
          <form action={createSop} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="How we cut reels" required />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="editing / sales / ops" defaultValue="general" />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" name="tags" placeholder="reels, hooks" />
            </div>
            <div className="md:col-span-12">
              <Label htmlFor="url">Link to the SOP *</Label>
              <Input id="url" name="url" type="url" placeholder="https://docs.google.com/document/d/..." required />
              <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-muted-2)]">
                Google Doc, Notion page, Drive file — wherever the SOP actually lives.
              </p>
            </div>
            <div className="md:col-span-12 flex justify-end">
              <Button type="submit">Create SOP</Button>
            </div>
          </form>
        </div>
      </details>

      {/* List */}
      {sops.length === 0 ? (
        <Empty>No SOPs match your filter. Try clearing search or category.</Empty>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sops.map((s) => {
            const host = hostnameFromUrl(s.url);
            return (
              <li key={s.id}>
                <article className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors h-full flex flex-col">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-5 flex-1"
                    >
                      <SopCardBody sop={s} host={host} />
                    </a>
                  ) : (
                    <div className="p-5 flex-1 opacity-70">
                      <SopCardBody sop={s} host={host} />
                      <div className="mt-2 text-[10px] uppercase tracking-widest text-[var(--color-yellow)]">
                        ⚠ Missing link — click Edit to add one
                      </div>
                    </div>
                  )}
                  <div className="border-t border-[var(--color-border)] px-5 py-2 flex items-center justify-between">
                    <Link
                      href={`/sops/${s.id}`}
                      className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] hover:text-white"
                    >
                      Edit
                    </Link>
                    {host && (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-muted-2)]">
                        {host}
                      </span>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SopCardBody({ sop, host }: { sop: Sop; host: string | null }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge tone={sop.pinned ? "accent" : "neutral"}>{sop.category}</Badge>
            {sop.pinned && <Badge tone="accent">★ Pinned</Badge>}
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors">
            {sop.title}
          </h3>
          {sop.tags && sop.tags.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {sop.tags.map((t) => (
                <span key={t} className="text-[10px] text-[var(--color-muted)]">#{t}</span>
              ))}
            </div>
          )}
        </div>
        {sop.url ? (
          <span className="text-[var(--color-muted-2)] group-hover:text-[var(--color-accent)] transition-colors shrink-0">
            ↗
          </span>
        ) : null}
      </div>
      {host && (
        <div className="mt-3 text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
          Opens in {host}
        </div>
      )}
    </>
  );
}
