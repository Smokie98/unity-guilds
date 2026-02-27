import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// PUT /api/events/[id] — update an event
export async function PUT(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("events")
    .select("guild")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (!isGuildStaff(user, existing.guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const updates = {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.event_date !== undefined && { event_date: body.event_date }),
    ...(body.event_time !== undefined && { event_time: body.event_time }),
    ...(body.location !== undefined && { location: body.location }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/events/[id] — delete an event
export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("events")
    .select("guild")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (!isGuildStaff(user, existing.guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
