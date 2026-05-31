"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/app/lib/supabase";

export async function submitEod(formData: FormData) {
  const sb = supabaseServer();
  const author = String(formData.get("author") ?? "").trim();
  if (!author) return;
  const wins = String(formData.get("wins") ?? "").trim() || null;
  const blockers = String(formData.get("blockers") ?? "").trim() || null;
  const tomorrow = String(formData.get("tomorrow") ?? "").trim() || null;
  const hours = formData.get("hours_worked") ? Number(formData.get("hours_worked")) : null;
  const mood = (String(formData.get("mood") ?? "").trim() || null) as "green" | "yellow" | "red" | null;
  const dateRaw = String(formData.get("report_date") ?? "").trim();
  const report_date = dateRaw || new Date().toISOString().slice(0, 10);

  await sb.from("hub_eod").insert({
    author, wins, blockers, tomorrow, hours_worked: hours, mood, report_date,
  });
  revalidatePath("/eod");
  revalidatePath("/");
}

export async function deleteEod(id: string) {
  const sb = supabaseServer();
  await sb.from("hub_eod").delete().eq("id", id);
  revalidatePath("/eod");
  revalidatePath("/");
}
