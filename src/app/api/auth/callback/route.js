import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Discord OAuth callback handler
// Flow: User clicks "Continue with Discord" -> Discord login -> redirect here -> verify roles -> set session
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const guildSlug = searchParams.get("state"); // We pass the target guild/page as state
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/?error=no_code`);
  }

  try {
    // 1. Exchange code for Discord access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${siteUrl}/api/auth/callback`,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Discord token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${siteUrl}/?error=token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Get Discord user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${siteUrl}/?error=user_fetch_failed`);
    }

    const discordUser = await userRes.json();

    // 3. Check guild membership and roles
    // Import guild config to get server IDs
    const { GUILDS } = await import("@/lib/guilds");
    let userGuild = null;
    let userRoles = [];

    // Check each guild's Discord server for membership
    for (const [slug, guild] of Object.entries(GUILDS)) {
      if (!guild.discord.serverId) continue;

      try {
        const memberRes = await fetch(
          `https://discord.com/api/users/@me/guilds/${guild.discord.serverId}/member`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (memberRes.ok) {
          const memberData = await memberRes.json();
          // Get role names from the member data
          // Note: In production, you'd resolve role IDs to names via the guild roles API
          // For now, we check if they have any roles in the server
          if (memberData.roles && memberData.roles.length > 0) {
            userGuild = slug;
            userRoles = memberData.roles;
            // If this is the guild they're trying to access, prefer it
            if (slug === guildSlug) break;
          }
        }
      } catch {
        // Server not accessible, skip
      }
    }

    if (!userGuild) {
      return NextResponse.redirect(`${siteUrl}/?error=not_member`);
    }

    // 4. Upsert user in Supabase using service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: upsertError } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          discord_id: discordUser.id,
          username: discordUser.username,
          display_name: discordUser.global_name || discordUser.username,
          avatar_url: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          guild: userGuild,
          discord_roles: userRoles,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "discord_id" }
      );

    if (upsertError) {
      console.error("User upsert error:", upsertError);
    }

    // 5. Set a session cookie with user info
    const cookieStore = await cookies();
    const sessionData = {
      discord_id: discordUser.id,
      username: discordUser.username,
      display_name: discordUser.global_name || discordUser.username,
      avatar_url: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      guild: userGuild,
      roles: userRoles,
    };

    cookieStore.set("unity-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // 6. Redirect to the target page
    const redirectTo = guildSlug === "games" ? "/guildie-games" : `/${guildSlug || userGuild}`;
    return NextResponse.redirect(`${siteUrl}${redirectTo}`);
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${siteUrl}/?error=auth_failed`);
  }
}
