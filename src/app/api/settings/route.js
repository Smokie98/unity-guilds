import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// GET /api/settings?guild=women — get site settings for a guild
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const guild = searchParams.get("guild");

  if (!guild) {
    return NextResponse.json({ error: "guild parameter required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("guild", guild)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/settings — update site settings for a guild
export async function PUT(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { guild } = body;

  if (!guild) {
    return NextResponse.json({ error: "guild required" }, { status: 400 });
  }

  if (!isGuildStaff(user, guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const updates = {
    ...(body.theme_colors !== undefined && { theme_colors: body.theme_colors }),
    ...(body.section_order !== undefined && { section_order: body.section_order }),
    ...(body.section_visibility !== undefined && { section_visibility: body.section_visibility }),
    ...(body.custom_css !== undefined && { custom_css: body.custom_css }),
    ...(body.heading_font !== undefined && { heading_font: body.heading_font }),
    ...(body.body_font !== undefined && { body_font: body.body_font }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .update(updates)
    .eq("guild", guild)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
