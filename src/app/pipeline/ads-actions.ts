"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/app/lib/supabase";

const AD_STAGES = ["concept", "production", "review", "testing", "scaling", "killed"] as const;
type AdStage = (typeof AD_STAGES)[number];

export async function createAd(formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const creative_type = (String(formData.get("creative_type") ?? "").trim() || null) as "static" | "dynamic" | null;
  const format = String(formData.get("format") ?? "").trim() || null;
  const platform = String(formData.get("platform") ?? "").trim() || null;
  const campaign = String(formData.get("campaign") ?? "").trim() || null;
  const ad_set = String(formData.get("ad_set") ?? "").trim() || null;
  const owner = String(formData.get("owner") ?? "").trim() || null;
  const editor = String(formData.get("editor") ?? "").trim() || null;
  const hook = String(formData.get("hook") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await sb.from("hub_ads").insert({
    title, creative_type, format, platform, campaign, ad_set, owner, editor, hook, notes,
    stage: "concept",
  });
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function setAdStage(id: string, stage: AdStage) {
  const sb = supabaseServer();
  const launched_at = stage === "testing" || stage === "scaling"
    ? new Date().toISOString()
    : null;
  const patch: Record<string, unknown> = { stage };
  // Only stamp launched_at when moving INTO testing/scaling and it isn't already set
  if (launched_at) {
    const { data } = await sb.from("hub_ads").select("launched_at").eq("id", id).single();
    if (!data?.launched_at) patch.launched_at = launched_at;
  }
  await sb.from("hub_ads").update(patch).eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function deleteAd(id: string) {
  const sb = supabaseServer();
  await sb.from("hub_ads").delete().eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

const TEXT_FIELDS = ["title", "notes", "owner", "editor", "platform", "hook", "asset_url", "ad_set", "campaign", "format", "due_date"];
const ENUM_FIELDS = ["creative_type"];
const NUMERIC_FIELDS = ["cpm", "ctr", "amount_spent", "results", "cost_per_result", "frequency", "impressions"];

export async function updateAdField(id: string, field: string, value: string) {
  const sb = supabaseServer();
  let patch: Record<string, unknown>;
  if (TEXT_FIELDS.includes(field)) {
    patch = { [field]: value || null };
  } else if (ENUM_FIELDS.includes(field)) {
    patch = { [field]: value || null };
  } else if (NUMERIC_FIELDS.includes(field)) {
    const n = value === "" ? null : Number(value);
    if (n !== null && Number.isNaN(n)) return;
    patch = { [field]: n };
  } else {
    return;
  }
  await sb.from("hub_ads").update(patch).eq("id", id);
  revalidatePath("/pipeline");
}

export async function updateAdMetrics(id: string, metrics: {
  cpm?: number | null;
  ctr?: number | null;
  amount_spent?: number | null;
  results?: number | null;
  cost_per_result?: number | null;
  frequency?: number | null;
  impressions?: number | null;
}) {
  const sb = supabaseServer();
  await sb.from("hub_ads").update({ ...metrics, metrics_updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/");
}
