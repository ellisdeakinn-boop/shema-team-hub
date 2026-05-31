"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Badge } from "@/app/_components/ui";
import { cn } from "@/app/lib/cn";
import { setAdStage, deleteAd } from "../../ads-actions";
import { AdEditTrigger } from "./ad-card-actions";

type AdStage = "concept" | "production" | "review" | "testing" | "scaling" | "killed";

export type AdCard = {
  id: string;
  title: string;
  notes: string | null;
  owner: string | null;
  editor: string | null;
  platform: string | null;
  hook: string | null;
  asset_url: string | null;
  campaign: string | null;
  ad_set: string | null;
  stage: AdStage;
  creative_type: "static" | "dynamic" | null;
  format: string | null;
  cpm: number | null;
  ctr: number | null;
  amount_spent: number | null;
  results: number | null;
  cost_per_result: number | null;
  frequency: number | null;
  impressions: number | null;
  metrics_updated_at: string | null;
  due_date: string | null;
  launched_at: string | null;
  updated_at: string;
};

const STAGES: { key: AdStage; label: string; tone: "neutral" | "yellow" | "accent" | "green" | "red" }[] = [
  { key: "concept",    label: "Concept",    tone: "neutral" },
  { key: "production", label: "Production", tone: "neutral" },
  { key: "review",     label: "Review",     tone: "yellow"  },
  { key: "testing",    label: "Testing",    tone: "accent"  },
  { key: "scaling",    label: "Scaling",    tone: "green"   },
  { key: "killed",     label: "Killed",     tone: "red"     },
];

const compact = (n: number | null) => {
  if (n === null || n === undefined) return null;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const money = (n: number | null) => {
  if (n === null || n === undefined) return null;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};

export function AdsKanban({ initialCards }: { initialCards: AdCard[] }) {
  const [cards, setCards] = useState<AdCard[]>(initialCards);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<AdStage | null>(null);
  const [, startTransition] = useTransition();

  const byStage = Object.fromEntries(
    STAGES.map((s) => [s.key, cards.filter((c) => c.stage === s.key)])
  ) as Record<AdStage, AdCard[]>;

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragEnd = () => { setDragId(null); setDragOverStage(null); };
  const onDragOverColumn = (e: React.DragEvent, stage: AdStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) setDragOverStage(stage);
  };
  const onDropColumn = (e: React.DragEvent, stage: AdStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    setDragId(null);
    setDragOverStage(null);
    if (!id) return;
    const current = cards.find((c) => c.id === id);
    if (!current || current.stage === stage) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    startTransition(() => { void setAdStage(id, stage); });
  };

  const onMobileMove = (id: string, direction: "left" | "right") => {
    const current = cards.find((c) => c.id === id);
    if (!current) return;
    const idx = STAGES.findIndex((s) => s.key === current.stage);
    const nextIdx = direction === "right"
      ? Math.min(STAGES.length - 1, idx + 1)
      : Math.max(0, idx - 1);
    const next = STAGES[nextIdx].key;
    if (next === current.stage) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, stage: next } : c)));
    startTransition(() => { void setAdStage(id, next); });
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this ad?")) return;
    setCards((prev) => prev.filter((c) => c.id !== id));
    startTransition(() => { void deleteAd(id); });
  };

  const onCardUpdate = (id: string, patch: Partial<AdCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
      {STAGES.map((s, i) => {
        const list = byStage[s.key];
        const isDragTarget = dragOverStage === s.key;
        return (
          <div
            key={s.key}
            onDragOver={(e) => onDragOverColumn(e, s.key)}
            onDragLeave={() => setDragOverStage((cur) => (cur === s.key ? null : cur))}
            onDrop={(e) => onDropColumn(e, s.key)}
            className={cn(
              "flex flex-col rounded-sm border bg-[var(--color-surface)] p-3 min-h-[200px] transition-colors",
              isDragTarget
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                : "border-[var(--color-border)]"
            )}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="mono text-[9px] tabular-nums text-[var(--color-muted-2)] tracking-widest">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Badge tone={s.tone}>{s.label}</Badge>
              </div>
              <span className="mono text-[10px] tabular-nums text-[var(--color-muted-2)]">{list.length}</span>
            </div>

            <div className="space-y-2 min-h-[60px]">
              {list.map((c) => {
                const isDragging = dragId === c.id;
                const hasMetrics =
                  c.cpm !== null || c.ctr !== null || c.amount_spent !== null ||
                  c.results !== null || c.cost_per_result !== null ||
                  c.frequency !== null || c.impressions !== null;
                return (
                  <article
                    key={c.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, c.id)}
                    onDragEnd={onDragEnd}
                    className={cn(
                      "group rounded-sm border bg-[var(--color-surface-2)] p-3 cursor-grab active:cursor-grabbing transition-all",
                      isDragging
                        ? "opacity-30 border-[var(--color-accent)] scale-[0.98]"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                    )}
                  >
                    <h3 className="text-sm font-semibold text-white leading-snug select-none">{c.title}</h3>
                    {c.hook && (
                      <p className="mt-1 text-xs text-[var(--color-muted)] italic line-clamp-2 select-none">
                        &ldquo;{c.hook}&rdquo;
                      </p>
                    )}

                    {/* Type + format badges — primary ad metadata */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {c.creative_type && (
                        <Badge tone={c.creative_type === "dynamic" ? "accent" : "neutral"}>
                          {c.creative_type === "dynamic" ? "▶ Dynamic" : "▦ Static"}
                        </Badge>
                      )}
                      {c.format && <Badge tone="neutral">{c.format}</Badge>}
                      {c.platform && <Badge>{c.platform}</Badge>}
                    </div>

                    {/* Secondary metadata */}
                    {(c.campaign || c.ad_set) && (
                      <div className="mt-2 text-[10px] text-[var(--color-muted)] truncate">
                        {c.campaign && <span>📁 {c.campaign}</span>}
                        {c.campaign && c.ad_set && <span className="text-[var(--color-muted-2)]"> · </span>}
                        {c.ad_set && <span>{c.ad_set}</span>}
                      </div>
                    )}

                    {c.asset_url && (
                      <a
                        href={c.asset_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseDown={(e) => e.stopPropagation()}
                        className="mt-2 inline-block text-[11px] text-[var(--color-accent)] hover:underline truncate max-w-full"
                      >
                        Asset →
                      </a>
                    )}

                    {/* Metrics strip — 7 ad metrics */}
                    {hasMetrics && (
                      <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                        <div className="grid grid-cols-4 gap-1">
                          <MetricMini label="Spend" value={money(c.amount_spent)} />
                          <MetricMini label="Imp" value={compact(c.impressions)} />
                          <MetricMini label="CPM" value={money(c.cpm)} />
                          <MetricMini label="CTR" value={c.ctr !== null ? `${c.ctr.toFixed(2)}%` : null} />
                        </div>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          <MetricMini label="Results" value={compact(c.results)} />
                          <MetricMini label="CPR" value={money(c.cost_per_result)} />
                          <MetricMini label="Freq" value={c.frequency !== null ? c.frequency.toFixed(1) : null} />
                        </div>
                        {c.metrics_updated_at && (
                          <div className="mt-1 text-[8px] uppercase tracking-widest text-[var(--color-muted-2)] text-right">
                            Updated {format(new Date(c.metrics_updated_at), "MMM d")}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                      <div className="flex items-center gap-1 md:hidden">
                        <button
                          onClick={() => onMobileMove(c.id, "left")}
                          className="px-1.5 py-0.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
                          aria-label="Move left"
                        >←</button>
                        <button
                          onClick={() => onMobileMove(c.id, "right")}
                          className="px-1.5 py-0.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
                          aria-label="Move right"
                        >→</button>
                      </div>
                      <span className="hidden md:inline-block text-[9px] uppercase tracking-widest text-[var(--color-muted-2)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Drag
                      </span>
                      <div className="flex items-center gap-2">
                        <AdEditTrigger ad={c} onUpdate={(patch) => onCardUpdate(c.id, patch)} />
                        <button
                          onClick={() => onDelete(c.id)}
                          className="text-[10px] uppercase tracking-wider text-[var(--color-muted-2)] hover:text-[var(--color-red)]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {list.length === 0 && (
                <div className={cn(
                  "text-[10px] uppercase tracking-widest text-center py-8 rounded-sm border border-dashed transition-colors",
                  isDragTarget
                    ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-muted-2)]"
                )}>
                  {isDragTarget ? "Drop here" : "Empty"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricMini({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="text-center">
      <div className="mono text-[8px] uppercase tracking-widest text-[var(--color-muted-2)]">{label}</div>
      <div className="mono text-[10px] tabular-nums text-white">{value ?? "–"}</div>
    </div>
  );
}
