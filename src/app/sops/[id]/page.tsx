import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/app/lib/supabase";
import { PageHeader, Card, Button, Input, Label, Badge } from "@/app/_components/ui";
import { updateSop, deleteSop, togglePin } from "../actions";
import { format } from "date-fns";

export const revalidate = 0;

type Params = Promise<{ id: string }>;

function hostnameFromUrl(u: string | null): string | null {
  if (!u) return null;
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return null; }
}

export default async function SopDetail({ params }: { params: Params }) {
  const { id } = await params;
  const sb = supabaseServer();
  const { data } = await sb.from("hub_sops").select("*").eq("id", id).single();
  if (!data) notFound();

  const host = hostnameFromUrl(data.url);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/sops"
          className="text-xs uppercase tracking-wider text-[var(--color-muted)] hover:text-white"
        >
          ← All SOPs
        </Link>
      </div>

      <PageHeader
        eyebrow={data.category}
        title={data.title}
        subtitle={`Updated ${format(new Date(data.updated_at), "MMM d yyyy 'at' h:mma")}`}
        actions={
          <div className="flex items-center gap-2">
            {data.url && (
              <a href={data.url} target="_blank" rel="noopener noreferrer">
                <Button>Open SOP ↗</Button>
              </a>
            )}
            <form action={async () => { "use server"; await togglePin(id, data.pinned); }}>
              <Button type="submit" variant="secondary">{data.pinned ? "★ Unpin" : "☆ Pin"}</Button>
            </form>
          </div>
        }
      />

      {data.tags && data.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {data.tags.map((t: string) => (<Badge key={t}>#{t}</Badge>))}
        </div>
      )}

      <Card>
        <form action={updateSop.bind(null, id)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={data.title} required />
          </div>
          <div>
            <Label htmlFor="url">Link to the SOP</Label>
            <Input id="url" name="url" type="url" defaultValue={data.url ?? ""} placeholder="https://docs.google.com/document/d/..." />
            {host && (
              <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-muted-2)]">
                Currently opens in {host}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={data.category} />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" name="tags" defaultValue={(data.tags ?? []).join(", ")} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <form action={async () => { "use server"; await deleteSop(id); }}>
              <Button type="submit" variant="danger">Delete SOP</Button>
            </form>
            <div className="flex items-center gap-2">
              <Link href="/sops">
                <Button type="button" variant="ghost">Back</Button>
              </Link>
              <Button type="submit">Save changes</Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Show body if it exists (legacy SOPs created before the link-only switch) */}
      {data.body && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-6 bg-[var(--color-accent)]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Legacy notes
            </h3>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--color-muted)]">
            {data.body}
          </pre>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-[var(--color-muted-2)]">
            These notes were stored before SOPs moved to external links. Move them into your linked doc when you get a chance.
          </p>
        </Card>
      )}
    </div>
  );
}
