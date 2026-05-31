"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Badge } from "@/app/_components/ui";
import { cn } from "@/app/lib/cn";
import { setStage, deleteCard, updateCardField } from "../actions";
import { CardEditTrigger } from "./card-actions";

type Stage = "idea" | "script" | "record" | "edit" | "review" | "posted";

export type PipelineCard = {
  id: string;
  title: string;
  notes: string | null;
  owner: string | null;
  editor: string | null;
  platform: string | null;
  stage: Stage;
  hook: string | null;
  asset_url: string | null;
  due_date: string | null;
  posted_at: string | null;
  updated_at: string;
  views: number | null;
  engagement: number | null;
  follower_delta: number | null;
  link_clicks: number | null;
};

const compact = (n: number | null) => {
  if (n === null || n === undefined) return null;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const STAGES: { key: Stage; label: string; tone: "neutral" | "yellow" | "accent" | "green" }[] = [
  { key: "idea",    label: "Idea",    tone: "neutral" },
  { key: "script",  label: "Script",  tone: "neutral" },
  { key: "record",  label: "Record",  tone: "yellow"  },
  { key: "edit",    label: "Edit",    tone: "yellow"  },
  { key: "review",  label: "Review",  tone: "accent"  },
  { key: "posted",  label: "Posted",  tone: "green"   },
];

function MetricMini({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="text-center">
      <div className="text-[8px] uppercase tracking-widest text-[var(--color-muted-2)]">{label}</div>
      <div className="text-[10px] font-semibold tabular-nums text-white">{value ?? "–"}</div>
    </div>
  );
}

export function KanbanBoard({ initialCards }: { initialCards: PipelineCard[] }) {
  const [cards, setCards] = useState<PipelineCard[]>(initialCards);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [, startTransition] = useTransition();

  const byStage = Object.fromEntries(
    STAGES.map((s) => [s.key, cards.filter((c) => c.stage === s.key)])
  ) as Record<Stage, PipelineCard[]>;

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragEnd = () => {
    setDragId(null);
    setDragOverStage(null);
  };

  const onDragOverColumn = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) setDragOverStage(stage);
  };

  const onDropColumn = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    setDragId(null);
    setDragOverStage(null);
    if (!id) return;
    const current = cards.find((c) => c.id === id);
    if (!current || current.stage === stage) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    startTransition(() => {
      void setStage(id, stage);
    });
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
    startTransition(() => { void setStage(id, next); });
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this card?")) return;
    setCards((prev) => prev.filter((c) => c.id !== id));
    startTransition(() => { void deleteCard(id); });
  };

  const onCardUpdate = async (id: string, patch: Partial<PipelineCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === "string" || v === null) {
        await updateCardField(id, k, (v ?? "") as string);
      }
    }
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
                <span className="text-[9px] tabular-nums text-[var(--color-muted-2)] tracking-widest">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Badge tone={s.tone}>{s.label}</Badge>
              </div>
              <span className="text-[10px] tabular-nums text-[var(--color-muted-2)]">
                {list.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[60px]">
              {list.map((c) => {
                const isDragging = dragId === c.id;
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
                    <h3 className="text-sm font-semibold text-white leading-snug select-none">
                      {c.title}
                    </h3>
                    {c.hook && (
                      <p className="mt-1 text-xs text-[var(--color-muted)] italic line-clamp-2 select-none">
                        &ldquo;{c.hook}&rdquo;
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {c.platform && <Badge tone="neutral">{c.platform}</Badge>}
                      {c.owner && <Badge>{c.owner}</Badge>}
                      {c.editor && <Badge tone="accent">✂ {c.editor}</Badge>}
                    </div>
                    {c.due_date && (
                      <div className="mt-2 text-[10px] uppercase tracking-widest text-[var(--color-muted-2)]">
                        Due {format(new Date(c.due_date), "MMM d")}
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

                    {/* Metrics strip — only shows once any metric exists */}
                    {(c.views !== null || c.engagement !== null || c.follower_delta !== null || c.link_clicks !== null) && (
                      <div className="mt-2 grid grid-cols-4 gap-1 pt-2 border-t border-[var(--color-border)]">
                        <MetricMini label="Views" value={compact(c.views)} />
                        <MetricMini label="Eng" value={compact(c.engagement)} />
                        <MetricMini label="+Fol" value={compact(c.follower_delta)} />
                        <MetricMini label="Clk" value={compact(c.link_clicks)} />
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                      <div className="flex items-center gap-1 md:hidden">
                        <button
                          onClick={() => onMobileMove(c.id, "left")}
                          className="px-1.5 py-0.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
                          aria-label="Move left"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => onMobileMove(c.id, "right")}
                          className="px-1.5 py-0.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
                          aria-label="Move right"
                        >
                          →
                        </button>
                      </div>
                      <span className="hidden md:inline-block text-[9px] uppercase tracking-widest text-[var(--color-muted-2)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Drag
                      </span>
                      <div className="flex items-center gap-2">
                        <CardEditTrigger card={c} onSaved={(patch) => onCardUpdate(c.id, patch)} />
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
