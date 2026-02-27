import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { canAccessAdmin, isGuildStaff, isSuperAdmin } from "./permissions";

// Create a Supabase admin client (bypasses RLS)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Parse the unity-session cookie and return the user object (or null)
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("unity-session");
    if (!sessionCookie) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// Require an authenticated user — returns user or throws
export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    throw new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

// Require admin access — returns user or throws
export async function requireAdmin() {
  const user = await requireAuth();
  if (!canAccessAdmin(user)) {
    throw new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

// Require access to a specific guild — returns user or throws
export async function requireGuildAccess(guild) {
  const user = await requireAuth();
  if (!isGuildStaff(user, guild)) {
    throw new Response(
      JSON.stringify({ error: "No access to this guild" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return user;
}

// Get the Supabase admin client for API routes (bypasses RLS)
export { getSupabaseAdmin };
