import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// POST /api/migrate — one-time migration to add twitch_channels column
export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Try to update all rows with a twitch_channels field — if the column doesn't exist, it will fail
  // First, try reading a setting to see if column already exists
  const { data: testRow, error: testError } = await supabase
    .from("site_settings")
    .select("twitch_channels")
    .limit(1);

  if (!testError) {
    return NextResponse.json({ message: "twitch_channels column already exists", data: testRow });
  }

  // Column doesn't exist — we need to add it via Supabase SQL Editor
  // Since we can't run raw ALTER TABLE via the JS client, return instructions
  return NextResponse.json({
    message: "Column does not exist yet. Run this SQL in Supabase SQL Editor:",
    sql: "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS twitch_channels TEXT[] DEFAULT '{}';"
  });
}
