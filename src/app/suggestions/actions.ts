"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/app/lib/supabase";

export async function createSuggestion(formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const author = String(formData.get("author") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim() || null;
  const area = String(formData.get("area") ?? "general").trim() || "general";

  await sb.from("hub_suggestions").insert({ title, body, author, area });
  revalidatePath("/suggestions");
  revalidatePath("/");
}

export async function upvote(id: string) {
  const sb = supabaseServer();
  const { data } = await sb.from("hub_suggestions").select("upvotes").eq("id", id).single();
  const current = data?.upvotes ?? 0;
  await sb.from("hub_suggestions").update({ upvotes: current + 1 }).eq("id", id);
  revalidatePath("/suggestions");
  revalidatePath("/");
}

export async function setStatus(id: string, status: "open" | "planned" | "shipped" | "wontfix") {
  const sb = supabaseServer();
  await sb.from("hub_suggestions").update({ status }).eq("id", id);
  revalidatePath("/suggestions");
  revalidatePath("/");
}

export async function deleteSuggestion(id: string) {
  const sb = supabaseServer();
  await sb.from("hub_suggestions").delete().eq("id", id);
  revalidatePath("/suggestions");
  revalidatePath("/");
}
