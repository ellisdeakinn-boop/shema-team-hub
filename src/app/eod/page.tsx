import { supabaseServer } from "@/app/lib/supabase";
import { PageHeader, Card, Button, Input, Textarea, Select, Label, Badge, Empty } from "@/app/_components/ui";
import { submitEod, deleteEod } from "./actions";
import { format } from "date-fns";

export const revalidate = 0;

type EodReport = {
  id: string;
  author: string;
  report_date: string;
  wins: string | null;
  blockers: string | null;
  tomorrow: string | null;
  hours_worked: number | null;
  mood: "green" | "yellow" | "red" | null;
  created_at: string;
};

type SearchParams = Promise<{ author?: string }>;

export default async function EodPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const sb = supabaseServer();
  const todayStr = new Date().toISOString().slice(0, 10);

  let query = sb.from("hub_eod").select("*").order("report_date", { ascending: false }).order("created_at", { ascending: false });
  if (params.author) query = query.eq("author", params.author);
  const { data } = await query.limit(100);

  const reports = (data ?? []) as EodReport[];

  // Distinct authors for filter pills
  const { data: allAuthors } = await sb.from("hub_eod").select("author");
  const authorSet = new Set((allAuthors ?? []).map((a: { author: string }) => a.author));
  const authors = Array.from(authorSet).sort();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="04 · Daily wrap"
        title="EOD Reports"
        subtitle="End-of-day check-ins. Submit yours, scan the team's. Keep it short — 60 seconds, max."
      />

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Submit today&apos;s EOD</h2>
        <form action={submitEod} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <Label htmlFor="author">Your name</Label>
            <Input id="author" name="author" placeholder="Shema / Editor name" required />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="report_date">Date</Label>
            <Input id="report_date" name="report_date" type="date" defaultValue={todayStr} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="hours_worked">Hours</Label>
            <Input id="hours_worked" name="hours_worked" type="number" step="0.5" min="0" max="24" placeholder="8" />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="mood">How was the day?</Label>
            <Select id="mood" name="mood" defaultValue="green">
              <option value="green">Green · crushed it</option>
              <option value="yellow">Yellow · mid</option>
              <option value="red">Red · rough</option>
            </Select>
          </div>
          <div className="md:col-span-12">
            <Label htmlFor="wins">Wins / what you shipped</Label>
            <Textarea id="wins" name="wins" rows={3} placeholder="What got done today." />
          </div>
          <div className="md:col-span-6">
            <Label htmlFor="blockers">Blockers</Label>
            <Textarea id="blockers" name="blockers" rows={3} placeholder="What's in the way." />
          </div>
          <div className="md:col-span-6">
            <Label htmlFor="tomorrow">Plan for tomorrow</Label>
            <Textarea id="tomorrow" name="tomorrow" rows={3} placeholder="Top 1-3 things for tomorrow." />
          </div>
          <div className="md:col-span-12 flex justify-end">
            <Button type="submit">Submit report</Button>
          </div>
        </form>
      </Card>

      {/* Filter pills */}
      {authors.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Filter:</span>
          <a
            href="/eod"
            className={`px-3 py-1 text-xs rounded-full border ${!params.author ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "text-[var(--color-muted)] border-[var(--color-border)] hover:text-white"}`}
          >
            Everyone
          </a>
          {authors.map((a) => (
            <a
              key={a}
              href={`/eod?author=${encodeURIComponent(a)}`}
              className={`px-3 py-1 text-xs rounded-full border ${params.author === a ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "text-[var(--color-muted)] border-[var(--color-border)] hover:text-white"}`}
            >
              {a}
            </a>
          ))}
        </div>
      )}

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white">History</h2>
        {reports.length === 0 ? (
          <Empty>No EOD reports yet.</Empty>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id}>
                <Card>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div>
                        <h3 className="text-base font-semibold text-white">{r.author}</h3>
                        <div className="text-xs text-[var(--color-muted)]">
                          {format(new Date(r.report_date), "EEE, MMM d yyyy")}
                          {r.hours_worked != null && ` · ${r.hours_worked}h`}
                        </div>
                      </div>
                      {r.mood && (
                        <Badge tone={r.mood}>
                          {r.mood === "green" ? "Crushed" : r.mood === "yellow" ? "Mid" : "Rough"}
                        </Badge>
                      )}
                    </div>
                    <form action={async () => { "use server"; await deleteEod(r.id); }}>
                      <Button type="submit" variant="ghost" className="text-xs px-2 py-1">Delete</Button>
                    </form>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Section label="Wins" value={r.wins} />
                    <Section label="Blockers" value={r.blockers} />
                    <Section label="Tomorrow" value={r.tomorrow} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Section({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-2)] mb-1">{label}</div>
      <div className="text-sm text-[var(--color-fg)] whitespace-pre-wrap">{value || <span className="text-[var(--color-muted-2)]">—</span>}</div>
    </div>
  );
}
