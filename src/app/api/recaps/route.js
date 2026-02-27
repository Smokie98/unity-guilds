import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// GET /api/recaps?guild=women
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const guild = searchParams.get("guild");

  if (!guild) {
    return NextResponse.json({ error: "guild parameter required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("guild_hall_recaps")
    .select("*")
    .eq("guild", guild)
    .order("meeting_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/recaps
export async function POST(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { guild, title, content, summary, meeting_date, topics } = body;

  if (!guild || !title) {
    return NextResponse.json({ error: "guild and title required" }, { status: 400 });
  }

  if (!isGuildStaff(user, guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("guild_hall_recaps")
    .insert({
      guild,
      title,
      content: content || null,
      summary: summary || null,
      meeting_date: meeting_date || null,
      topics: topics || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
