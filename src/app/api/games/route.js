import { NextResponse } from "next/server";
import { getSession, getSupabaseAdmin } from "@/lib/auth-helpers";
import { isSuperAdmin } from "@/lib/permissions";

// GET /api/games — get all months and scores
export async function GET() {
  const supabase = getSupabaseAdmin();

  const [monthsRes, scoresRes] = await Promise.all([
    supabase
      .from("guildie_games_months")
      .select("*")
      .order("month_number", { ascending: true }),
    supabase
      .from("guildie_games_scores")
      .select("*")
      .order("score", { ascending: false }),
  ]);

  if (monthsRes.error) {
    return NextResponse.json({ error: monthsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    months: monthsRes.data || [],
    scores: scoresRes.data || [],
  });
}

// PUT /api/games — update months and/or scores (super admin only)
export async function PUT(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const supabase = getSupabaseAdmin();
  const errors = [];

  // Update months if provided
  if (body.months && Array.isArray(body.months)) {
    for (const month of body.months) {
      const { error } = await supabase
        .from("guildie_games_months")
        .update({
          challenge_name: month.challenge_name,
          status: month.status,
          start_date: month.start_date,
          end_date: month.end_date,
          winner_guild: month.winner_guild || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", month.id);

      if (error) errors.push(error.message);
    }
  }

  // Update or insert scores if provided
  if (body.scores && Array.isArray(body.scores)) {
    for (const score of body.scores) {
      const { error } = await supabase
        .from("guildie_games_scores")
        .upsert(
          {
            month_id: score.month_id,
            guild: score.guild,
            score: score.score,
            score_unit: score.score_unit || "points",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "month_id,guild" }
        );

      if (error) errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
