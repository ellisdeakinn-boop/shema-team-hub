import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/app/lib/supabase";
import { PageHeader, Card, Button, Input, Textarea, Label, Badge } from "@/app/_components/ui";
import { updateSop, deleteSop, togglePin } from "../actions";
import { format } from "date-fns";

export const revalidate = 0;

type Params = Promise<{ id: string }>;
type Search = Promise<{ edit?: string }>;

export default async function SopDetail({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const sb = supabaseServer();
  const { data } = await sb.from("hub_sops").select("*").eq("id", id).single();
  if (!data) notFound();

  const isEditing = edit === "1";

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
            <form action={async () => { "use server"; await togglePin(id, data.pinned); }}>
              <Button type="submit" variant="secondary">{data.pinned ? "★ Unpin" : "☆ Pin"}</Button>
            </form>
            {!isEditing && (
              <Link href={`/sops/${id}?edit=1`}>
                <Button variant="secondary">Edit</Button>
              </Link>
            )}
          </div>
        }
      />

      {data.tags && data.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {data.tags.map((t: string) => (
            <Badge key={t}>#{t}</Badge>
          ))}
        </div>
      )}

      {isEditing ? (
        <Card>
          <form action={updateSop.bind(null, id)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={data.title} required />
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
            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" name="body" rows={20} defaultValue={data.body} />
            </div>
            <div className="flex items-center justify-between">
              <form action={async () => { "use server"; await deleteSop(id); }}>
                <Button type="submit" variant="danger">Delete SOP</Button>
              </form>
              <div className="flex items-center gap-2">
                <Link href={`/sops/${id}`}>
                  <Button type="button" variant="ghost">Cancel</Button>
                </Link>
                <Button type="submit">Save changes</Button>
              </div>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="prose prose-invert max-w-none text-sm">
            {data.body ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--color-fg)]">
                {data.body}
              </pre>
            ) : (
              <p className="text-[var(--color-muted)]">No content yet. Click Edit to add some.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
