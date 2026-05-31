"use client";

import { useState, useTransition } from "react";
import { Button, Input, Textarea, Select, Label } from "@/app/_components/ui";
import { updateAdField, updateAdMetrics } from "../../ads-actions";
import type { AdCard } from "./ads-kanban";

const FORMAT_OPTIONS = [
  { value: "", label: "—" },
  { value: "1:1", label: "1:1 (square)" },
  { value: "4:5", label: "4:5 (portrait)" },
  { value: "9:16", label: "9:16 (vertical)" },
  { value: "16:9", label: "16:9 (landscape)" },
  { value: "carousel", label: "Carousel" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Reel" },
];

const numOrNull = (v: string) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const intOrNull = (v: string) => {
  const n = numOrNull(v);
  return n === null ? null : Math.round(n);
};

function AdEditor({
  ad,
  onClose,
  onUpdate,
}: {
  ad: AdCard;
  onClose: () => void;
  onUpdate?: (patch: Partial<AdCard>) => void;
}) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    title: ad.title ?? "",
    creative_type: ad.creative_type ?? "",
    format: ad.format ?? "",
    platform: ad.platform ?? "",
    campaign: ad.campaign ?? "",
    ad_set: ad.ad_set ?? "",
    owner: ad.owner ?? "",
    editor: ad.editor ?? "",
    hook: ad.hook ?? "",
    asset_url: ad.asset_url ?? "",
    due_date: ad.due_date ?? "",
    notes: ad.notes ?? "",
  });

  const [metrics, setMetrics] = useState({
    amount_spent: ad.amount_spent?.toString() ?? "",
    impressions: ad.impressions?.toString() ?? "",
    cpm: ad.cpm?.toString() ?? "",
    ctr: ad.ctr?.toString() ?? "",
    results: ad.results?.toString() ?? "",
    cost_per_result: ad.cost_per_result?.toString() ?? "",
    frequency: ad.frequency?.toString() ?? "",
  });

  const save = () => {
    start(async () => {
      for (const [k, v] of Object.entries(form)) {
        await updateAdField(ad.id, k, v);
      }
      const metricsPatch = {
        amount_spent: numOrNull(metrics.amount_spent),
        impressions: intOrNull(metrics.impressions),
        cpm: numOrNull(metrics.cpm),
        ctr: numOrNull(metrics.ctr),
        results: intOrNull(metrics.results),
        cost_per_result: numOrNull(metrics.cost_per_result),
        frequency: numOrNull(metrics.frequency),
      };
      await updateAdMetrics(ad.id, metricsPatch);
      onUpdate?.({
        ...form,
        creative_type: (form.creative_type || null) as "static" | "dynamic" | null,
        ...metricsPatch,
        metrics_updated_at: new Date().toISOString(),
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
        className="w-full max-w-3xl rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="h-px w-6 bg-[var(--color-accent)]" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Ad creative
          </h3>
        </div>
        <h2 className="text-xl font-bold text-white mb-5 tracking-tight">Edit ad</h2>

        {/* Creative metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Creative type</Label>
            <Select
              value={form.creative_type}
              onChange={(e) => setForm({ ...form, creative_type: e.target.value })}
            >
              <option value="">— Choose —</option>
              <option value="static">Static (image / graphic)</option>
              <option value="dynamic">Dynamic (video)</option>
            </Select>
          </div>
          <div>
            <Label>Format</Label>
            <Select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
            >
              {FORMAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Platform</Label>
            <Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Meta, TikTok Ads, YouTube Ads..." />
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div>
            <Label>Campaign</Label>
            <Input value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} placeholder="Q3 - Cold Acquisition" />
          </div>
          <div>
            <Label>Ad set</Label>
            <Input value={form.ad_set} onChange={(e) => setForm({ ...form, ad_set: e.target.value })} placeholder="Cold AU 25-45 LAL 1%" />
          </div>
          <div>
            <Label>Owner</Label>
            <Input list="team-members" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>
          <div>
            <Label>Editor</Label>
            <Input list="team-members" value={form.editor} onChange={(e) => setForm({ ...form, editor: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Hook</Label>
            <Input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder="3 second opener" />
          </div>
          <div className="md:col-span-2">
            <Label>Asset URL</Label>
            <Input value={form.asset_url} onChange={(e) => setForm({ ...form, asset_url: e.target.value })} placeholder="Drive / Frame.io link" />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-6 bg-[var(--color-accent)]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Performance metrics
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>Amount spent ($)</Label>
              <Input type="number" step="0.01" min="0" inputMode="decimal"
                value={metrics.amount_spent}
                onChange={(e) => setMetrics({ ...metrics, amount_spent: e.target.value })}
                placeholder="0.00" />
            </div>
            <div>
              <Label>Impressions</Label>
              <Input type="number" min="0" inputMode="numeric"
                value={metrics.impressions}
                onChange={(e) => setMetrics({ ...metrics, impressions: e.target.value })}
                placeholder="0" />
            </div>
            <div>
              <Label>CPM ($)</Label>
              <Input type="number" step="0.01" min="0" inputMode="decimal"
                value={metrics.cpm}
                onChange={(e) => setMetrics({ ...metrics, cpm: e.target.value })}
                placeholder="0.00" />
            </div>
            <div>
              <Label>CTR (%)</Label>
              <Input type="number" step="0.001" min="0" inputMode="decimal"
                value={metrics.ctr}
                onChange={(e) => setMetrics({ ...metrics, ctr: e.target.value })}
                placeholder="1.234" />
            </div>
            <div>
              <Label>Results</Label>
              <Input type="number" min="0" inputMode="numeric"
                value={metrics.results}
                onChange={(e) => setMetrics({ ...metrics, results: e.target.value })}
                placeholder="0" />
            </div>
            <div>
              <Label>Cost per result ($)</Label>
              <Input type="number" step="0.01" min="0" inputMode="decimal"
                value={metrics.cost_per_result}
                onChange={(e) => setMetrics({ ...metrics, cost_per_result: e.target.value })}
                placeholder="0.00" />
            </div>
            <div>
              <Label>Frequency</Label>
              <Input type="number" step="0.01" min="0" inputMode="decimal"
                value={metrics.frequency}
                onChange={(e) => setMetrics({ ...metrics, frequency: e.target.value })}
                placeholder="1.50" />
            </div>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-[var(--color-muted-2)]">
            Pulled from Meta Ads Manager — paste the live numbers and save.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button onClick={save} disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}

export function AdEditTrigger({
  ad,
  onUpdate,
}: {
  ad: AdCard;
  onUpdate?: (patch: Partial<AdCard>) => void;
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
      {open && <AdEditor ad={ad} onClose={() => setOpen(false)} onUpdate={onUpdate} />}
    </>
  );
}
