"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/app/lib/supabase";

export async function createPriority(formData: FormData) {
  const sb = supabaseServer();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const description = String(formData.get("description") ?? "").trim() || null;
  const owner = String(formData.get("owner") ?? "").trim() || null;
  const priority = Number(formData.get("priority") ?? 2);
  const due = String(formData.get("due_date") ?? "").trim() || null;

  await sb.from("hub_priorities").insert({
    title,
    description,
    owner,
    priority,
    due_date: due,
  });
  revalidatePath("/priorities");
  revalidatePath("/");
}

export async function updatePriorityStatus(id: string, status: "open" | "in_progress" | "done") {
  const sb = supabaseServer();
  await sb.from("hub_priorities").update({ status }).eq("id", id);
  revalidatePath("/priorities");
  revalidatePath("/");
}

export async function deletePriority(id: string) {
  const sb = supabaseServer();
  await sb.from("hub_priorities").delete().eq("id", id);
  revalidatePath("/priorities");
  revalidatePath("/");
}
