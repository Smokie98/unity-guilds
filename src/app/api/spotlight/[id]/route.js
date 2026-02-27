import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// PUT /api/spotlight/[id]
export async function PUT(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("spotlight")
    .select("guild")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Spotlight not found" }, { status: 404 });
  }

  if (!isGuildStaff(user, existing.guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  // If marking as current, un-mark any existing current spotlight
  if (body.is_current) {
    await supabase
      .from("spotlight")
      .update({ is_current: false })
      .eq("guild", existing.guild)
      .eq("is_current", true)
      .neq("id", id);
  }

  const updates = {
    ...(body.member_name !== undefined && { member_name: body.member_name }),
    ...(body.member_handle !== undefined && { member_handle: body.member_handle }),
    ...(body.member_avatar !== undefined && { member_avatar: body.member_avatar }),
    ...(body.bio !== undefined && { bio: body.bio }),
    ...(body.twitch_url !== undefined && { twitch_url: body.twitch_url }),
    ...(body.achievement !== undefined && { achievement: body.achievement }),
    ...(body.featured_week !== undefined && { featured_week: body.featured_week }),
    ...(body.is_current !== undefined && { is_current: body.is_current }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("spotlight")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/spotlight/[id]
export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("spotlight")
    .select("guild")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Spotlight not found" }, { status: 404 });
  }

  if (!isGuildStaff(user, existing.guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const { error } = await supabase.from("spotlight").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
