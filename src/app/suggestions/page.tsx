import Link from "next/link";
import { supabaseServer } from "@/app/lib/supabase";
import { PageHeader, Card, Button, Input, Textarea, Select, Label, Badge, Empty } from "@/app/_components/ui";
import { createSuggestion, upvote, setStatus, deleteSuggestion } from "./actions";
import { format } from "date-fns";

export const revalidate = 0;

type Suggestion = {
  id: string;
  title: string;
  body: string | null;
  author: string | null;
  area: string;
  status: "open" | "planned" | "shipped" | "wontfix";
  upvotes: number;
  created_at: string;
};

const STATUS_TONE: Record<Suggestion["status"], "yellow" | "accent" | "green" | "neutral"> = {
  open: "yellow",
  planned: "accent",
  shipped: "green",
  wontfix: "neutral",
};

type Search = Promise<{ status?: string }>;

export default async function SuggestionsPage({ searchParams }: { searchParams: Search }) {
  const { status: filterStatus } = await searchParams;
  const sb = supabaseServer();
  let q = sb.from("hub_suggestions").select("*").order("upvotes", { ascending: false }).order("created_at", { ascending: false });
  if (filterStatus) q = q.eq("status", filterStatus);
  const { data } = await q;
  const items = (data ?? []) as Suggestion[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="06 · Improve"
        title="Suggestions"
        subtitle="Spot something we could do better? Drop the idea. Upvote what matters."
      />

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">New idea</h2>
        <form action={createSuggestion} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <Label htmlFor="title">Idea</Label>
            <Input id="title" name="title" placeholder="Cut review cycles by 2 days with..." required />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="author">Your name (optional)</Label>
            <Input id="author" name="author" placeholder="anonymous" />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="area">Area</Label>
            <Input id="area" name="area" placeholder="editing / sales / ops" defaultValue="general" />
          </div>
          <div className="md:col-span-12">
            <Label htmlFor="body">Details</Label>
            <Textarea id="body" name="body" rows={3} placeholder="Why it matters, how it could work." />
          </div>
          <div className="md:col-span-12 flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Card>

      <div className="flex items-center gap-2 flex-wrap">
        {["", "open", "planned", "shipped", "wontfix"].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/suggestions?status=${s}` : "/suggestions"}
            className={`px-3 py-1 text-xs rounded-full border ${
              (filterStatus ?? "") === s
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "text-[var(--color-muted)] border-[var(--color-border)] hover:text-white"
            }`}
          >
            {s ? s[0].toUpperCase() + s.slice(1) : "All"}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <Empty>No suggestions yet — be the first to drop an idea.</Empty>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => (
            <li key={s.id}>
              <Card>
                <div className="flex items-start gap-4">
                  {/* Upvote */}
                  <form action={async () => { "use server"; await upvote(s.id); }}>
                    <button
                      type="submit"
                      className="flex flex-col items-center justify-center w-14 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] hover:bg-[var(--color-accent)]/15 hover:border-[var(--color-accent)] transition-colors"
                    >
                      <span className="text-lg leading-none text-[var(--color-accent)]">▲</span>
                      <span className="text-sm font-bold text-white">{s.upvotes}</span>
                    </button>
                  </form>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                      <Badge>{s.area}</Badge>
                      <span className="text-xs text-[var(--color-muted-2)]">
                        by {s.author ?? "anonymous"} · {format(new Date(s.created_at), "MMM d")}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-white">{s.title}</h3>
                    {s.body && (
                      <p className="mt-1 text-sm text-[var(--color-muted)] whitespace-pre-wrap">
                        {s.body}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <form action={async () => { "use server"; await setStatus(s.id, "planned"); }}>
                        <Button type="submit" variant="ghost" className="text-xs px-2 py-1">Plan</Button>
                      </form>
                      <form action={async () => { "use server"; await setStatus(s.id, "shipped"); }}>
                        <Button type="submit" variant="ghost" className="text-xs px-2 py-1">Shipped</Button>
                      </form>
                      <form action={async () => { "use server"; await setStatus(s.id, "wontfix"); }}>
                        <Button type="submit" variant="ghost" className="text-xs px-2 py-1">Won&apos;t fix</Button>
                      </form>
                      <form action={async () => { "use server"; await setStatus(s.id, "open"); }}>
                        <Button type="submit" variant="ghost" className="text-xs px-2 py-1">Reopen</Button>
                      </form>
                      <form action={async () => { "use server"; await deleteSuggestion(s.id); }}>
                        <Button type="submit" variant="ghost" className="text-xs px-2 py-1 text-[var(--color-muted-2)] hover:text-[var(--color-red)]">Delete</Button>
                      </form>
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
