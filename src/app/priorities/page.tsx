import { supabaseServer } from "@/app/lib/supabase";
import { PageHeader, Card, Button, Input, Textarea, Select, Label, Badge, Empty } from "@/app/_components/ui";
import { createPriority, updatePriorityStatus, deletePriority } from "./actions";
import { format } from "date-fns";

export const revalidate = 0;

type Priority = {
  id: string;
  title: string;
  description: string | null;
  owner: string | null;
  status: "open" | "in_progress" | "done";
  priority: 1 | 2 | 3;
  due_date: string | null;
  created_at: string;
};

const PRI_LABEL: Record<number, string> = { 1: "P1 · Critical", 2: "P2 · High", 3: "P3 · Normal" };
const PRI_TONE: Record<number, "red" | "yellow" | "neutral"> = { 1: "red", 2: "yellow", 3: "neutral" };

export default async function PrioritiesPage() {
  const sb = supabaseServer();
  const { data } = await sb
    .from("hub_priorities")
    .select("*")
    .order("status", { ascending: true })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  const items = (data ?? []) as Priority[];
  const grouped = {
    open: items.filter((i) => i.status === "open"),
    in_progress: items.filter((i) => i.status === "in_progress"),
    done: items.filter((i) => i.status === "done"),
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="02 · Focus"
        title="Priorities"
        subtitle="What the team is locked in on this week. Keep this list short and ruthless."
      />

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Add a priority</h2>
        <form action={createPriority} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Ship Q3 webinar funnel" required />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" name="owner" placeholder="Ellis / Shema" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" name="priority" defaultValue="2">
              <option value="1">P1 · Critical</option>
              <option value="2">P2 · High</option>
              <option value="3">P3 · Normal</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="due_date">Due</Label>
            <Input id="due_date" name="due_date" type="date" />
          </div>
          <div className="md:col-span-1">
            <Button type="submit">Add</Button>
          </div>
          <div className="md:col-span-12">
            <Label htmlFor="description">Notes</Label>
            <Textarea id="description" name="description" rows={2} placeholder="Optional context, links, success criteria." />
          </div>
        </form>
      </Card>

      <PrioritySection title="In progress" items={grouped.in_progress} accent />
      <PrioritySection title="Open" items={grouped.open} />
      <PrioritySection title="Done" items={grouped.done} muted />
    </div>
  );
}

function PrioritySection({
  title,
  items,
  accent = false,
  muted = false,
}: {
  title: string;
  items: Priority[];
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${accent ? "text-[var(--color-accent)]" : muted ? "text-[var(--color-muted-2)]" : "text-white"}`}>
          {title}
        </h2>
        <span className="text-xs text-[var(--color-muted-2)]">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <Empty>Nothing here yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id}>
              <Card className={muted ? "opacity-60" : undefined}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={PRI_TONE[p.priority]}>{PRI_LABEL[p.priority]}</Badge>
                      {p.owner && <Badge>{p.owner}</Badge>}
                      {p.due_date && (
                        <Badge tone="neutral">Due {format(new Date(p.due_date), "MMM d")}</Badge>
                      )}
                    </div>
                    <h3 className={`mt-2 text-base font-semibold ${muted ? "line-through text-[var(--color-muted)]" : "text-white"}`}>
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="mt-1 text-sm text-[var(--color-muted)] whitespace-pre-wrap">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <PriorityActions id={p.id} status={p.status} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PriorityActions({
  id,
  status,
}: {
  id: string;
  status: "open" | "in_progress" | "done";
}) {
  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <form action={async () => {
        "use server";
        const next = status === "open" ? "in_progress" : status === "in_progress" ? "done" : "open";
        await updatePriorityStatus(id, next);
      }}>
        <Button type="submit" variant="secondary">
          {status === "open" ? "Start" : status === "in_progress" ? "Mark done" : "Reopen"}
        </Button>
      </form>
      <form action={async () => { "use server"; await deletePriority(id); }}>
        <Button type="submit" variant="ghost" className="text-xs px-2 py-1">
          Delete
        </Button>
      </form>
    </div>
  );
}
