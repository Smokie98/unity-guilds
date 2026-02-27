import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// GET /api/highlights?guild=women
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const guild = searchParams.get("guild");

  if (!guild) {
    return NextResponse.json({ error: "guild parameter required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("guild", guild)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/highlights
export async function POST(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { guild, title, description, event_type, image_url, event_date } = body;

  if (!guild || !title) {
    return NextResponse.json({ error: "guild and title required" }, { status: 400 });
  }

  if (!isGuildStaff(user, guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("highlights")
    .insert({
      guild,
      title,
      description: description || null,
      event_type: event_type || null,
      image_url: image_url || null,
      event_date: event_date || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
