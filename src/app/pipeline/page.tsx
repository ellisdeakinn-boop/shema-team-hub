import Link from "next/link";
import { supabaseServer } from "@/app/lib/supabase";
import { PageHeader, Card, Button, Input, Textarea, Select, Label } from "@/app/_components/ui";
import { TeamSelect } from "@/app/_components/team-select";
import { cn } from "@/app/lib/cn";
import { createCard } from "./actions";
import { createAd } from "./ads-actions";
import { KanbanBoard, type PipelineCard } from "./_components/kanban-board";
import { AdsKanban, type AdCard } from "./_components/ads/ads-kanban";

export const revalidate = 0;

type SearchParams = Promise<{ tab?: string }>;

export default async function PipelinePage({ searchParams }: { searchParams: SearchParams }) {
  const { tab } = await searchParams;
  const activeTab = tab === "ads" ? "ads" : "organic";

  const sb = supabaseServer();

  if (activeTab === "ads") {
    const { data } = await sb
      .from("hub_ads")
      .select("*")
      .order("position", { ascending: true })
      .order("updated_at", { ascending: false });
    const ads = (data ?? []) as AdCard[];

    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow="03 · Paid"
          title="Ad Creatives"
          subtitle="Concept to scaling. Tag each creative as static or dynamic, set the format, and log live performance metrics from Meta."
        />
        <Tabs active={activeTab} counts={{ organic: null, ads: ads.length }} />
        <NewAdForm />
        <AdsKanban initialCards={ads} />
      </div>
    );
  }

  const { data } = await sb
    .from("hub_pipeline")
    .select("*")
    .order("position", { ascending: true })
    .order("updated_at", { ascending: false });
  const cards = (data ?? []) as PipelineCard[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="03 · Content"
        title="Organic Pipeline"
        subtitle="Drag cards between stages to move them through production. Idea → Script → Record → Edit → Review → Posted."
      />
      <Tabs active={activeTab} counts={{ organic: cards.length, ads: null }} />
      <NewOrganicForm />
      <KanbanBoard initialCards={cards} />
    </div>
  );
}

function Tabs({
  active,
  counts,
}: {
  active: "organic" | "ads";
  counts: { organic: number | null; ads: number | null };
}) {
  const items = [
    { key: "organic" as const, label: "Organic", href: "/pipeline" },
    { key: "ads" as const,     label: "Ads",     href: "/pipeline?tab=ads" },
  ];
  return (
    <div className="flex items-center border-b border-[var(--color-border)] -mt-4">
      {items.map((t, i) => {
        const isActive = active === t.key;
        const count = counts[t.key];
        return (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.22em] font-medium border-b-2 transition-colors -mb-px",
              isActive
                ? "text-white border-[var(--color-accent)]"
                : "text-[var(--color-muted)] border-transparent hover:text-white"
            )}
          >
            <span className="text-[9px] tabular-nums opacity-60">
              0{i + 1}
            </span>
            {t.label}
            {count !== null && (
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-sm text-[9px] tabular-nums font-semibold",
                isActive
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface-2)] text-[var(--color-muted)]"
              )}>
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function NewOrganicForm() {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] tabular-nums tracking-widest text-[var(--color-muted-2)]">NEW</span>
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Add content card</h2>
      </div>
      <form action={createCard} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="The myth that's killing your videography business" required />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="platform">Platform</Label>
          <Input id="platform" name="platform" placeholder="IG / TT / YT" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="owner">Owner</Label>
          <TeamSelect id="owner" name="owner" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="editor">Editor</Label>
          <TeamSelect id="editor" name="editor" />
        </div>
        <div className="md:col-span-1">
          <Button type="submit">Add</Button>
        </div>
        <div className="md:col-span-12">
          <Label htmlFor="hook">Hook</Label>
          <Input id="hook" name="hook" placeholder="3 second opener" />
        </div>
        <div className="md:col-span-12">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={2} placeholder="Talking points, B-roll, references." />
        </div>
      </form>
    </Card>
  );
}

function NewAdForm() {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] tabular-nums tracking-widest text-[var(--color-muted-2)]">NEW</span>
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Add ad creative</h2>
      </div>
      <form action={createAd} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-5">
          <Label htmlFor="ad-title">Title</Label>
          <Input id="ad-title" name="title" placeholder="Marcus testimonial · 30s VSL" required />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="creative_type">Type</Label>
          <Select id="creative_type" name="creative_type" defaultValue="">
            <option value="">—</option>
            <option value="static">Static</option>
            <option value="dynamic">Dynamic</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="format">Format</Label>
          <Select id="format" name="format" defaultValue="">
            <option value="">—</option>
            <option value="1:1">1:1</option>
            <option value="4:5">4:5</option>
            <option value="9:16">9:16</option>
            <option value="16:9">16:9</option>
            <option value="carousel">Carousel</option>
            <option value="story">Story</option>
            <option value="reel">Reel</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="ad-platform">Platform</Label>
          <Input id="ad-platform" name="platform" placeholder="Meta" defaultValue="Meta" />
        </div>
        <div className="md:col-span-1">
          <Button type="submit">Add</Button>
        </div>
        <div className="md:col-span-4">
          <Label htmlFor="campaign">Campaign</Label>
          <Input id="campaign" name="campaign" placeholder="Q3 - Cold Acquisition" />
        </div>
        <div className="md:col-span-4">
          <Label htmlFor="ad_set">Ad set</Label>
          <Input id="ad_set" name="ad_set" placeholder="Cold AU 25-45 LAL 1%" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="ad-owner">Owner</Label>
          <TeamSelect id="ad-owner" name="owner" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="ad-editor">Editor</Label>
          <TeamSelect id="ad-editor" name="editor" />
        </div>
        <div className="md:col-span-12">
          <Label htmlFor="ad-hook">Hook</Label>
          <Input id="ad-hook" name="hook" placeholder="3 second opener" />
        </div>
        <div className="md:col-span-12">
          <Label htmlFor="ad-notes">Notes</Label>
          <Textarea id="ad-notes" name="notes" rows={2} placeholder="Concept rationale, references, talking points." />
        </div>
      </form>
    </Card>
  );
}
