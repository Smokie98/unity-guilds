"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLandingGuilds, GUILDS } from "@/lib/guilds";

function DiscordIcon() {
  return (
    <svg className="discord-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

export default function Home() {
  const [authState, setAuthState] = useState({ show: false, guild: null, mode: null });
  const [sessionUser, setSessionUser] = useState(null);
  const guildSlugs = getLandingGuilds();
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setSessionUser(data); })
      .catch(() => {});
  }, []);

  function enterGuild(slug) {
    if (sessionUser) {
      router.push("/" + slug);
    } else {
      setAuthState({ show: true, guild: GUILDS[slug], mode: "guild", slug });
    }
  }

  function enterGames() {
    if (sessionUser) {
      router.push("/guildie-games");
    } else {
      setAuthState({ show: true, guild: null, mode: "games" });
    }
  }

  function closeAuth() {
    setAuthState({ show: false, guild: null, mode: null });
  }

  function handleVerify() {
    // Redirect to Discord OAuth for real authentication
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${siteUrl}/api/auth/callback`);
    const state = authState.mode === "games" ? "games" : (authState.slug || "");
    const scope = encodeURIComponent("identify guilds guilds.members.read");

    window.location.href =
      `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
  }

  return (
    <>
      {/* Animated background orbs */}
      <div className="bg-mesh">
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
      </div>

      <div className="landing-container">
        <header className="site-header">
          <div className="site-eyebrow">Twitch Community</div>
          <h1 className="site-title">Unity Guilds</h1>
          <p className="site-sub">
            Select your Guild to access your community newsletter, events,
            spotlights, and more.
          </p>
        </header>

        <div className="guild-grid">
          {guildSlugs.map((slug) => {
            const guild = GUILDS[slug];
            const cardClass = slug === "black" ? "black-guild" : slug;
            return (
              <div
                key={slug}
                className={`guild-card ${cardClass}`}
                onClick={() => enterGuild(slug)}
              >
                <div className="card-accent"></div>
                <div className="card-glow"></div>
                <div className="card-gem">{guild.emoji}</div>
                <div className="card-content">
                  <div className="card-guild-name">{guild.name}</div>
                  <div className="card-tagline">{guild.tagline}</div>
                  <button className="card-enter-btn">
                    {sessionUser ? null : <DiscordIcon />}
                    {sessionUser ? "Enter Guild →" : "Enter with Discord"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guildie Games Button */}
        <button className="games-btn" onClick={enterGames}>
          <div className="games-btn-content">
            <span className="games-trophy">🏆</span>
            <div className="games-text">
              <div className="games-title">Guildie Games</div>
              <div className="games-sub">
                Cross-guild competition · Month 2 Active · View scores &amp;
                standings
              </div>
            </div>
            <span className="games-arrow">→</span>
          </div>
        </button>

        <p className="footer-note">
          Connect via Discord to verify your Guild membership · Your data is
          never stored
        </p>
      </div>

      {/* Auth Overlay */}
      <div className={`auth-overlay ${authState.show ? "show" : ""}`}>
        {authState.mode === "games" ? (
          <div className="auth-card">
            <div
              className="auth-card-accent"
              style={{
                background:
                  "linear-gradient(90deg,#9146FF,#dc2626,#ea580c,#facc15,#4ade80,#a855f7)",
              }}
            ></div>
            <div
              className="auth-gem"
              style={{
                background:
                  "linear-gradient(135deg,rgba(250,204,21,0.2),rgba(168,85,247,0.2))",
                border: "1px solid rgba(250,204,21,0.3)",
                boxShadow: "0 8px 24px rgba(250,204,21,0.2)",
              }}
            >
              🏆
            </div>
            <div
              className="auth-title"
              style={{
                background:
                  "linear-gradient(90deg,#fbbf24,#f472b6,#a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Guildie Games
            </div>
            <p className="auth-sub">
              Connect your Discord to verify you&apos;re a member of any Unity
              Guild or the Indigenous Alliance to access the Guildie Games.
            </p>
            <button className="btn-discord" onClick={handleVerify}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Continue with Discord
            </button>
            <button className="auth-cancel" onClick={closeAuth}>
              ← Back to Guild Selection
            </button>
          </div>
        ) : authState.guild ? (
          <div className="auth-card">
            <div
              className="auth-card-accent"
              style={{ background: authState.guild.colors.gradient }}
            ></div>
            <div
              className="auth-gem"
              style={{
                background: `linear-gradient(135deg, ${authState.guild.colors.primary}4D, ${authState.guild.colors.accent}4D)`,
                border: `1px solid ${authState.guild.colors.primary}66`,
                boxShadow: `0 8px 24px ${authState.guild.colors.primary}4D`,
              }}
            >
              {authState.guild.emoji}
            </div>
            <div className="auth-title">{authState.guild.name}</div>
            <p className="auth-sub">
              Connect your Discord to verify your Guild membership and access
              the newsletter.
            </p>
            <button className="btn-discord" onClick={handleVerify}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Continue with Discord
            </button>
            <button className="auth-cancel" onClick={closeAuth}>
              ← Back to Guild Selection
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
