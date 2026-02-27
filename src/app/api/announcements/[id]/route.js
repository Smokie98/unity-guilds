import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// PUT /api/announcements/[id]
export async function PUT(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("announcements")
    .select("guild")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  if (!isGuildStaff(user, existing.guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const updates = {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.content !== undefined && { content: body.content }),
    ...(body.icon !== undefined && { icon: body.icon }),
    ...(body.pinned !== undefined && { pinned: body.pinned }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/announcements/[id]
export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("announcements")
    .select("guild")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  if (!isGuildStaff(user, existing.guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
