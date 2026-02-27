"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

// Hook to fetch all data for a guild page
export function useGuildData(guildSlug) {
  const [data, setData] = useState({
    newsletters: [],
    latestNewsletter: null,
    events: [],
    announcements: [],
    spotlight: null,
    pastSpotlights: [],
    recaps: [],
    highlights: [],
    settings: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!guildSlug) return;

    const supabase = createClient();

    async function fetchAll() {
      try {
        // Fetch all data in parallel
        const [
          newsletterRes,
          eventsRes,
          announcementsRes,
          spotlightCurrentRes,
          spotlightPastRes,
          recapsRes,
          highlightsRes,
          settingsRes,
        ] = await Promise.all([
          supabase
            .from("newsletters")
            .select("*")
            .eq("guild", guildSlug)
            .eq("published", true)
            .order("issue_number", { ascending: false })
            .limit(20),
          supabase
            .from("events")
            .select("*")
            .eq("guild", guildSlug)
            .gte("event_date", new Date().toISOString().split("T")[0])
            .order("event_date", { ascending: true })
            .limit(10),
          supabase
            .from("announcements")
            .select("*")
            .eq("guild", guildSlug)
            .order("pinned", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("spotlight")
            .select("*")
            .eq("guild", guildSlug)
            .eq("is_current", true)
            .single(),
          supabase
            .from("spotlight")
            .select("*")
            .eq("guild", guildSlug)
            .eq("is_current", false)
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("guild_hall_recaps")
            .select("*")
            .eq("guild", guildSlug)
            .order("meeting_date", { ascending: false })
            .limit(6),
          supabase
            .from("highlights")
            .select("*")
            .eq("guild", guildSlug)
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("site_settings")
            .select("*")
            .eq("guild", guildSlug)
            .single(),
        ]);

        setData({
          newsletters: newsletterRes.data || [],
          latestNewsletter: newsletterRes.data?.[0] || null,
          events: eventsRes.data || [],
          announcements: announcementsRes.data || [],
          spotlight: spotlightCurrentRes.data || null,
          pastSpotlights: spotlightPastRes.data || [],
          recaps: recapsRes.data || [],
          highlights: highlightsRes.data || [],
          settings: settingsRes.data || null,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching guild data:", error);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    }

    fetchAll();
  }, [guildSlug]);

  return data;
}

// Hook to fetch Guildie Games data
export function useGamesData() {
  const [data, setData] = useState({
    months: [],
    scores: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createClient();

    async function fetchGames() {
      try {
        const [monthsRes, scoresRes] = await Promise.all([
          supabase
            .from("guildie_games_months")
            .select("*")
            .order("month_number", { ascending: true }),
          supabase
            .from("guildie_games_scores")
            .select("*, guildie_games_months!inner(month_number)")
            .order("score", { ascending: false }),
        ]);

        // Group scores by month number
        const scoresByMonth = {};
        (scoresRes.data || []).forEach((score) => {
          const monthNum = score.guildie_games_months.month_number;
          if (!scoresByMonth[monthNum]) scoresByMonth[monthNum] = [];
          scoresByMonth[monthNum].push(score);
        });

        setData({
          months: monthsRes.data || [],
          scores: scoresByMonth,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching games data:", error);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    }

    fetchGames();
  }, []);

  return data;
}
