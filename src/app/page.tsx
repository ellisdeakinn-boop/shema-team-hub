import Link from "next/link";
import { supabaseServer } from "@/app/lib/supabase";
import { PageHeader, Card, Badge } from "@/app/_components/ui";
import { format } from "date-fns";

export const revalidate = 0;

async function getStats() {
  const sb = supabaseServer();
  const [priorities, pipeline, ads, eod, sops, suggestions] = await Promise.all([
    sb.from("hub_priorities").select("*", { count: "exact", head: false }).neq("status", "done"),
    sb.from("hub_pipeline").select("stage,title,owner,updated_at"),
    sb.from("hub_ads").select("stage,amount_spent,results"),
    sb.from("hub_eod").select("id,author,report_date,wins").order("created_at", { ascending: false }).limit(5),
    sb.from("hub_sops").select("id,title", { count: "exact", head: true }),
    sb.from("hub_suggestions").select("id,title,status,upvotes,author").eq("status", "open").order("upvotes", { ascending: false }).limit(5),
  ]);

  const organicStages: Record<string, number> = {
    idea: 0, script: 0, record: 0, edit: 0, review: 0, posted: 0,
  };
  (pipeline.data ?? []).forEach((p: { stage: string }) => {
    organicStages[p.stage] = (organicStages[p.stage] ?? 0) + 1;
  });

  const adStages: Record<string, number> = {
    concept: 0, production: 0, review: 0, testing: 0, scaling: 0, killed: 0,
  };
  let adSpend = 0;
  let adResults = 0;
  (ads.data ?? []).forEach((a: { stage: string; amount_spent: number | null; results: number | null }) => {
    adStages[a.stage] = (adStages[a.stage] ?? 0) + 1;
    if (a.amount_spent) adSpend += Number(a.amount_spent);
    if (a.results) adResults += Number(a.results);
  });

  return {
    openPriorities: priorities.data ?? [],
    organicStages,
    organicTotal: pipeline.data?.length ?? 0,
    adStages,
    adsTotal: ads.data?.length ?? 0,
    adSpend,
    adResults,
    recentEod: eod.data ?? [],
    sopCount: sops.count ?? 0,
    topSuggestions: suggestions.data ?? [],
  };
}

const QUICK_LINKS = [
  { href: "/priorities", label: "Priorities", desc: "Top focus items this week" },
  { href: "/pipeline", label: "Content Pipeline", desc: "Idea → Posted kanban" },
  { href: "/eod", label: "EOD Reports", desc: "Submit & review daily wraps" },
  { href: "/sops", label: "SOP Library", desc: "Process docs & playbooks" },
  { href: "/suggestions", label: "Suggestions", desc: "Improve how we work" },
];

export default async function DashboardPage() {
  const stats = await getStats();
  const organicStages = ["idea", "script", "record", "edit", "review", "posted"] as const;
  const adStages = ["concept", "production", "review", "testing", "scaling", "killed"] as const;
  const today = format(new Date(), "EEEE, MMM d");

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={`01 · Today · ${today}`}
        title="Team Command Center"
        subtitle="Everything the team needs to ship content and hit goals — pipeline, daily reports, SOPs, and ideas to make us better."
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatTile
          label="Open priorities"
          value={stats.openPriorities.length}
          href="/priorities"
        />
        <StatTile
          label="Organic"
          value={stats.organicTotal}
          href="/pipeline"
        />
        <StatTile
          label="Ad creatives"
          value={stats.adsTotal}
          href="/pipeline?tab=ads"
        />
        <StatTile
          label="SOPs"
          value={stats.sopCount}
          href="/sops"
        />
        <StatTile
          label="Open ideas"
          value={stats.topSuggestions.length}
          href="/suggestions"
        />
      </div>

      {/* Organic pipeline glance */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-[var(--color-accent)]" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Organic pipeline</h2>
          </div>
          <Link href="/pipeline" className="text-[11px] uppercase tracking-wider text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
            Open board →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {organicStages.map((s) => (
            <div
              key={s}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3"
            >
              <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted)]">{s}</div>
              <div className="mt-1 text-2xl font-bold text-white">{stats.organicStages[s] ?? 0}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ads pipeline glance */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-[var(--color-accent)]" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Ad creatives</h2>
            {(stats.adSpend > 0 || stats.adResults > 0) && (
              <span className="text-[10px] tabular-nums text-[var(--color-muted-2)] uppercase tracking-widest">
                · ${stats.adSpend.toFixed(0)} spent · {stats.adResults} results
              </span>
            )}
          </div>
          <Link href="/pipeline?tab=ads" className="text-[11px] uppercase tracking-wider text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
            Open board →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {adStages.map((s) => (
            <div
              key={s}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3"
            >
              <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted)]">{s}</div>
              <div className="mt-1 text-2xl font-bold text-white">{stats.adStages[s] ?? 0}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Two col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent EOD */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Latest EOD reports</h2>
            <Link href="/eod" className="text-xs uppercase tracking-wider text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
              All reports →
            </Link>
          </div>
          {stats.recentEod.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No reports yet — submit one to seed the feed.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentEod.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-4 border-t border-[var(--color-border)] pt-3 first:border-0 first:pt-0">
                  <div>
                    <div className="text-sm font-medium text-white">{r.author}</div>
                    <div className="text-xs text-[var(--color-muted)] line-clamp-2 mt-0.5">
                      {r.wins ?? "—"}
                    </div>
                  </div>
                  <Badge tone="neutral">{format(new Date(r.report_date), "MMM d")}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Top suggestions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top open suggestions</h2>
            <Link href="/suggestions" className="text-xs uppercase tracking-wider text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
              All ideas →
            </Link>
          </div>
          {stats.topSuggestions.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No open suggestions yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topSuggestions.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-4 border-t border-[var(--color-border)] pt-3 first:border-0 first:pt-0">
                  <div>
                    <div className="text-sm font-medium text-white">{s.title}</div>
                    <div className="text-xs text-[var(--color-muted)] mt-0.5">{s.author ?? "anon"}</div>
                  </div>
                  <Badge tone="accent">▲ {s.upvotes}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">Jump to</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUICK_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-2)]">
                    0{i + 1}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors">
                    {l.label}
                  </div>
                  <div className="mt-1 text-sm text-[var(--color-muted)]">{l.desc}</div>
                </div>
                <span className="text-[var(--color-muted-2)] group-hover:text-[var(--color-accent)] transition-colors">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </Link>
  );
}
