import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// GET /api/announcements?guild=women
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const guild = searchParams.get("guild");

  if (!guild) {
    return NextResponse.json({ error: "guild parameter required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("guild", guild)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/announcements
export async function POST(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { guild, title, content, icon, pinned } = body;

  if (!guild || !title || !content) {
    return NextResponse.json({ error: "guild, title, and content required" }, { status: 400 });
  }

  if (!isGuildStaff(user, guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      guild,
      title,
      content,
      icon: icon || "\ud83d\udce3",
      pinned: pinned || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
