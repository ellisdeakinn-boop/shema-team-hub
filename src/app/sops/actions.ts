"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/app/lib/supabase";

export async function createSop(formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!title || !url) return;
  const category = String(formData.get("category") ?? "general").trim() || "general";
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await sb.from("hub_sops").insert({ title, url, category, tags, body: null });
  revalidatePath("/sops");
  revalidatePath("/");
}

export async function updateSop(id: string, formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "general").trim() || "general";
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await sb.from("hub_sops").update({ title, url, category, tags }).eq("id", id);
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
