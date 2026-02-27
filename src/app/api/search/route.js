import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/auth-helpers";

// GET /api/search?q=keyword&guild=women — search across all content
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const guild = searchParams.get("guild");

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Search query must be at least 2 characters" }, { status: 400 });
  }

  if (!guild) {
    return NextResponse.json({ error: "guild parameter required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const searchPattern = `%${query}%`;

  // Search across all content types in parallel
  const [newsletters, events, announcements, spotlights, recaps, highlights] =
    await Promise.all([
      supabase
        .from("newsletters")
        .select("id, title, excerpt, content, published_at")
        .eq("guild", guild)
        .eq("published", true)
        .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
        .limit(5),
      supabase
        .from("events")
        .select("id, title, description, event_date, event_time, location")
        .eq("guild", guild)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(5),
      supabase
        .from("announcements")
        .select("id, title, content, icon, created_at")
        .eq("guild", guild)
        .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
        .limit(5),
      supabase
        .from("spotlight")
        .select("id, member_name, bio, twitch_url, is_current")
        .eq("guild", guild)
        .or(`member_name.ilike.${searchPattern},bio.ilike.${searchPattern}`)
        .limit(5),
      supabase
        .from("guild_hall_recaps")
        .select("id, title, summary, meeting_date")
        .eq("guild", guild)
        .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
        .limit(5),
      supabase
        .from("highlights")
        .select("id, title, description, event_date")
        .eq("guild", guild)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(5),
    ]);

  const results = {
    newsletters: newsletters.data || [],
    events: events.data || [],
    announcements: announcements.data || [],
    spotlights: spotlights.data || [],
    recaps: recaps.data || [],
    highlights: highlights.data || [],
  };

  // Count total results
  const totalResults = Object.values(results).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return NextResponse.json({ results, totalResults, query });
}
