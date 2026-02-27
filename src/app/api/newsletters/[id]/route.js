import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isGuildStaff } from "@/lib/permissions";

// GET /api/newsletters/[id] — get a single newsletter
export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/newsletters/[id] — update a newsletter
export async function PUT(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  // Fetch the newsletter to check guild access
  const { data: existing } = await supabase
    .from("newsletters")
    .select("guild")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  }

  if (!isGuildStaff(user, existing.guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const updates = {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.content !== undefined && { content: body.content }),
    ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
    ...(body.issue_number !== undefined && { issue_number: body.issue_number }),
    ...(body.published !== undefined && {
      published: body.published,
      published_at: body.published ? new Date().toISOString() : null,
    }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("newsletters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/newsletters/[id] — delete a newsletter
export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("newsletters")
    .select("guild")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  }

  if (!isGuildStaff(user, existing.guild)) {
    return NextResponse.json({ error: "No access to this guild" }, { status: 403 });
  }

  const { error } = await supabase.from("newsletters").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
