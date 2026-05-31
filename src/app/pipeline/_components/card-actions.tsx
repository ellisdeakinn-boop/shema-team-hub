"use client";

import { useState, useTransition } from "react";
import { moveCard, deleteCard, updateCardField, updateOrganicMetrics } from "../actions";
import { Button, Input, Textarea, Label } from "@/app/_components/ui";

export function CardMover({ id, stage }: { id: string; stage: string }) {
  const [pending, start] = useTransition();
  const isFirst = stage === "idea";
  const isLast = stage === "posted";
  return (
    <div className="flex items-center gap-1">
      <button
        disabled={isFirst || pending}
        onClick={() => start(() => { void moveCard(id, "left"); })}
        className="px-1.5 py-0.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white hover:border-[var(--color-border-strong)] disabled:opacity-30"
        aria-label="Move left"
      >
        ←
      </button>
      <button
        disabled={isLast || pending}
        onClick={() => start(() => { void moveCard(id, "right"); })}
        className="px-1.5 py-0.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white hover:border-[var(--color-border-strong)] disabled:opacity-30"
        aria-label="Move right"
      >
        →
      </button>
    </div>
  );
}

export function CardDelete({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this card?")) start(() => { void deleteCard(id); });
      }}
      className="text-[10px] uppercase tracking-wider text-[var(--color-muted-2)] hover:text-[var(--color-red)]"
    >
      Delete
    </button>
  );
}

type CardFields = {
  id: string;
  title: string;
  owner: string | null;
  editor: string | null;
  platform: string | null;
  hook: string | null;
  notes: string | null;
  asset_url: string | null;
  due_date: string | null;
  views?: number | null;
  engagement?: number | null;
  follower_delta?: number | null;
  link_clicks?: number | null;
};

const numOrNull = (v: string) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export function CardEditor({
  card,
  onClose,
  onSaved,
}: {
  card: CardFields;
  onClose: () => void;
  onSaved?: (patch: Record<string, string>) => void | Promise<void>;
}) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    title: card.title ?? "",
    owner: card.owner ?? "",
    editor: card.editor ?? "",
    platform: card.platform ?? "",
    hook: card.hook ?? "",
    notes: card.notes ?? "",
    asset_url: card.asset_url ?? "",
    due_date: card.due_date ?? "",
  });
  const [metrics, setMetrics] = useState({
    views: card.views?.toString() ?? "",
    engagement: card.engagement?.toString() ?? "",
    follower_delta: card.follower_delta?.toString() ?? "",
    link_clicks: card.link_clicks?.toString() ?? "",
  });

  const save = () => {
    start(async () => {
      if (onSaved) {
        await onSaved(form);
      } else {
        for (const [k, v] of Object.entries(form)) {
          await updateCardField(card.id, k, v);
        }
      }
      await updateOrganicMetrics(card.id, {
        views: numOrNull(metrics.views),
        engagement: numOrNull(metrics.engagement),
        follower_delta: numOrNull(metrics.follower_delta),
        link_clicks: numOrNull(metrics.link_clicks),
      });
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Edit card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Owner</Label>
            <Input list="team-members" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>
          <div>
            <Label>Editor</Label>
            <Input list="team-members" value={form.editor} onChange={(e) => setForm({ ...form, editor: e.target.value })} />
          </div>
          <div>
            <Label>Platform</Label>
            <Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Instagram, TikTok, YouTube..." />
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Hook</Label>
            <Input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder="3 second opener" />
          </div>
          <div className="md:col-span-2">
            <Label>Asset URL (Drive / Frame.io)</Label>
            <Input value={form.asset_url} onChange={(e) => setForm({ ...form, asset_url: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        {/* Metrics section */}
        <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-6 bg-[var(--color-accent)]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Performance metrics
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>Views</Label>
              <Input type="number" min="0" inputMode="numeric"
                value={metrics.views}
                onChange={(e) => setMetrics({ ...metrics, views: e.target.value })}
                placeholder="0" />
            </div>
            <div>
              <Label>Engagement</Label>
              <Input type="number" min="0" inputMode="numeric"
                value={metrics.engagement}
                onChange={(e) => setMetrics({ ...metrics, engagement: e.target.value })}
                placeholder="likes+comments+shares+saves" />
            </div>
            <div>
              <Label>New followers</Label>
              <Input type="number" inputMode="numeric"
                value={metrics.follower_delta}
                onChange={(e) => setMetrics({ ...metrics, follower_delta: e.target.value })}
                placeholder="0" />
            </div>
            <div>
              <Label>Link clicks</Label>
              <Input type="number" min="0" inputMode="numeric"
                value={metrics.link_clicks}
                onChange={(e) => setMetrics({ ...metrics, link_clicks: e.target.value })}
                placeholder="0" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button onClick={save} disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}

export function CardEditTrigger({
  card,
  onSaved,
}: {
  card: CardFields;
  onSaved?: (patch: Record<string, string>) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] uppercase tracking-wider text-[var(--color-muted-2)] hover:text-white"
      >
        Edit
      </button>
      {open && <CardEditor card={card} onClose={() => setOpen(false)} onSaved={onSaved} />}
    </>
  );
}
