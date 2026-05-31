"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/app/lib/supabase";

export async function createSop(formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const category = String(formData.get("category") ?? "general").trim() || "general";
  const body = String(formData.get("body") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const { data, error } = await sb.from("hub_sops").insert({ title, category, body, tags }).select("id").single();
  revalidatePath("/sops");
  revalidatePath("/");
  if (data && !error) redirect(`/sops/${data.id}`);
}

export async function updateSop(id: string, formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "general").trim() || "general";
  const body = String(formData.get("body") ?? "");
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await sb.from("hub_sops").update({ title, category, body, tags }).eq("id", id);
  revalidatePath(`/sops/${id}`);
  revalidatePath("/sops");
}

export async function deleteSop(id: string) {
  const sb = supabaseServer();
  await sb.from("hub_sops").delete().eq("id", id);
  revalidatePath("/sops");
  revalidatePath("/");
  redirect("/sops");
}

export async function togglePin(id: string, pinned: boolean) {
  const sb = supabaseServer();
  await sb.from("hub_sops").update({ pinned: !pinned }).eq("id", id);
  revalidatePath("/sops");
  revalidatePath(`/sops/${id}`);
}
