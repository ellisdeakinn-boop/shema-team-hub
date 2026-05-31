"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/app/lib/supabase";

export type SopActionState = {
  ok: boolean;
  message: string;
  id?: string;
} | null;

export async function createSopAction(
  _prev: SopActionState,
  formData: FormData
): Promise<SopActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!title) return { ok: false, message: "Title is required." };
  if (!url) return { ok: false, message: "Link to the SOP is required." };
  if (!/^https?:\/\//i.test(url)) {
    return { ok: false, message: "Link must start with http:// or https://" };
  }

  const category = String(formData.get("category") ?? "general").trim() || "general";
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("hub_sops")
    .insert({ title, url, category, tags, body: null })
    .select("id")
    .single();

  if (error) {
    console.error("[createSop] supabase error:", error);
    return { ok: false, message: `Database error: ${error.message}` };
  }

  revalidatePath("/sops");
  revalidatePath("/");
  return { ok: true, message: `Created "${title}"`, id: data?.id };
}

export async function updateSop(id: string, formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "general").trim() || "general";
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const { error } = await sb.from("hub_sops").update({ title, url, category, tags }).eq("id", id);
  if (error) {
    console.error("[updateSop] supabase error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
  revalidatePath(`/sops/${id}`);
  revalidatePath("/sops");
}

export async function deleteSop(id: string) {
  const sb = supabaseServer();
  const { error } = await sb.from("hub_sops").delete().eq("id", id);
  if (error) {
    console.error("[deleteSop] supabase error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
  revalidatePath("/sops");
  revalidatePath("/");
  redirect("/sops");
}

export async function togglePin(id: string, pinned: boolean) {
  const sb = supabaseServer();
  const { error } = await sb.from("hub_sops").update({ pinned: !pinned }).eq("id", id);
  if (error) {
    console.error("[togglePin] supabase error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
  revalidatePath("/sops");
  revalidatePath(`/sops/${id}`);
}
