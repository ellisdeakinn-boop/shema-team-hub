import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public anon client (read-only safe since RLS is off; we restrict mutations to the server client)
export const supabasePublic = createClient(url, anon, {
  auth: { persistSession: false },
});

// Server-side client with service-role key for mutations and admin reads
export function supabaseServer() {
  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}
