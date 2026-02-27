import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// GET /api/spotlight?guild=women
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const guild = searchParams.get("guild");

  if (!guild) {
    return NextResponse.json({ error: "guild parameter required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("spotlight")
    .select("*")
    .eq("guild", guild)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/spotlight
export async function POST(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { guild, member_name, member_handle, member_avatar, bio, twitch_url, achievement, featured_week, is_current } = body;

  if (!guild || !member_name) {
    return NextResponse.json({ error: "guild and member_name required" }, { status: 400 });
  }

  if (!isGuildStaff(user, guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();

  // If marking as current, un-mark any existing current spotlight for this guild
  if (is_current) {
    await supabase
      .from("spotlight")
      .update({ is_current: false })
      .eq("guild", guild)
      .eq("is_current", true);
  }

  const { data, error } = await supabase
    .from("spotlight")
    .insert({
      guild,
      member_name,
      member_handle: member_handle || null,
      member_avatar: member_avatar || null,
      bio: bio || null,
      twitch_url: twitch_url || null,
      achievement: achievement || null,
      featured_week: featured_week || null,
      is_current: is_current || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
