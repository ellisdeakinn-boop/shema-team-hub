"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/app/lib/supabase";

const STAGES = ["idea", "script", "record", "edit", "review", "posted"] as const;
type Stage = (typeof STAGES)[number];

export async function createCard(formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const owner = String(formData.get("owner") ?? "").trim() || null;
  const editor = String(formData.get("editor") ?? "").trim() || null;
  const platform = String(formData.get("platform") ?? "").trim() || null;
  const hook = String(formData.get("hook") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const due = String(formData.get("due_date") ?? "").trim() || null;

  await sb.from("hub_pipeline").insert({
    title, owner, editor, platform, hook, notes, due_date: due, stage: "idea",
  });
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function moveCard(id: string, direction: "left" | "right") {
  const sb = supabaseServer();
  const { data } = await sb.from("hub_pipeline").select("stage").eq("id", id).single();
  if (!data) return;
  const idx = STAGES.indexOf(data.stage as Stage);
  const nextIdx = direction === "right" ? Math.min(STAGES.length - 1, idx + 1) : Math.max(0, idx - 1);
  const nextStage = STAGES[nextIdx];
  const posted_at = nextStage === "posted" ? new Date().toISOString() : null;
  await sb.from("hub_pipeline").update({ stage: nextStage, posted_at }).eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function setStage(id: string, stage: Stage) {
  const sb = supabaseServer();
  const posted_at = stage === "posted" ? new Date().toISOString() : null;
  await sb.from("hub_pipeline").update({ stage, posted_at }).eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function deleteCard(id: string) {
  const sb = supabaseServer();
  await sb.from("hub_pipeline").delete().eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function updateCardField(id: string, field: string, value: string) {
  const sb = supabaseServer();
  const textFields = ["title", "owner", "editor", "platform", "hook", "notes", "asset_url", "due_date"];
  const numericFields = ["views", "engagement", "follower_delta", "link_clicks"];
  if (textFields.includes(field)) {
    await sb.from("hub_pipeline").update({ [field]: value || null }).eq("id", id);
  } else if (numericFields.includes(field)) {
    const n = value === "" ? null : Number(value);
    if (n !== null && Number.isNaN(n)) return;
    await sb.from("hub_pipeline").update({ [field]: n }).eq("id", id);
  } else {
    return;
  }
  revalidatePath("/pipeline");
}

export async function updateOrganicMetrics(id: string, metrics: {
  views?: number | null;
  engagement?: number | null;
  follower_delta?: number | null;
  link_clicks?: number | null;
}) {
  const sb = supabaseServer();
  await sb.from("hub_pipeline").update({ ...metrics, metrics_updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/");
}
