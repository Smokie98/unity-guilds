"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useGamesData } from "@/hooks/useGuildData";

const GUILD_INFO = {
  women: { name: "Women's Unity Guild", emoji: "\ud83d\udc9c" },
  black: { name: "The Black Guild", emoji: "\ud83d\udda4" },
  ia: { name: "Indigenous Alliance", emoji: "\ud83e\udeb6" },
  pride: { name: "Pride Guild", emoji: "\ud83c\udf08" },
  latin: { name: "Latin Guild", emoji: "\ud83e\udde1" },
};

const GUILD_ROW_CLASSES = {
  women: "women",
  black: "black-g",
  latin: "latin",
  pride: "pride",
  ia: "ia",
};

export default function GuildieGamesPage() {
  const { months, scores, loading } = useGamesData();
  const [activeMonth, setActiveMonth] = useState(null);

  // Build timeline data from real months, pad to 12
  const timeline = useMemo(() => {
    const items = [];
    for (let i = 1; i <= 12; i++) {
      const dbMonth = months.find((m) => m.month_number === i);
      if (dbMonth) {
        const statusIcon = dbMonth.status === "completed" ? "\u2705" : dbMonth.status === "active" ? "\ud83d\udfe1" : "";
        items.push({
          num: i,
          label: `Month ${i} \u2014 ${dbMonth.challenge_name || "TBA"}`,
          status: dbMonth.status || "upcoming",
          icon: statusIcon,
          data: dbMonth,
        });
      } else {
        items.push({ num: i, label: `Month ${i} \u2014 TBA`, status: "upcoming", icon: "", data: null });
      }
    }
    return items;
  }, [months]);

  // Auto-select the first active month, or the last completed month
  useMemo(() => {
    if (activeMonth !== null) return;
    const active = timeline.find((t) => t.status === "active");
    if (active) { setActiveMonth(active.num); return; }
    const completed = [...timeline].reverse().find((t) => t.status === "completed");
    if (completed) { setActiveMonth(completed.num); return; }
    setActiveMonth(1);
  }, [timeline, activeMonth]);

  function showMonth(num) {
    const item = timeline[num - 1];
    if (item.status === "upcoming") return;
    setActiveMonth(num);
  }

  // Build sorted leaderboard for a given month
  function getLeaderboard(monthNum) {
    const monthScores = scores[monthNum] || [];
    // Map scores into display rows
    const rows = monthScores.map((s) => {
      const info = GUILD_INFO[s.guild] || { name: s.guild, emoji: "" };
      return {
        key: s.guild,
        score: s.score || 0,
        scoreUnit: s.score_unit || "points",
        ...info,
        rowClass: GUILD_ROW_CLASSES[s.guild] || "",
      };
    });
    // Sort descending by score
    rows.sort((a, b) => b.score - a.score);
    // Add rank
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  }

  // Format score value for display (e.g., hours)
  function formatScore(score, unit) {
    if (unit && unit.toLowerCase().includes("hours")) {
      const hours = Math.floor(score);
      const minutes = Math.round((score - hours) * 60);
      return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    }
    return String(score);
  }

  if (loading) {
    return (
      <>
        <div className="bg-mesh">
          <div className="bg-orb" />
          <div className="bg-orb" />
          <div className="bg-orb" />
        </div>
        <div className="main" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
          <Link href="/" className="back-nav">{"\u2190"} All Guilds</Link>
          <div style={{ textAlign: "center", padding: "120px 0", color: "var(--muted)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{"\ud83c\udfc6"}</div>
            <div style={{ fontSize: "18px" }}>Loading Guildie Games...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Background */}
      <div className="bg-mesh">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <div className="main" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        {/* Back Navigation */}
        <Link href="/" className="back-nav">
          {"\u2190"} All Guilds
        </Link>

        {/* Hero */}
        <div className="hero" style={{ textAlign: "center", marginBottom: "60px" }}>
          <div className="hero-trophy">{"\ud83c\udfc6"}</div>
          <div className="hero-label" style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px"
          }}>
            Cross-Guild Competition &middot; Year One
          </div>
          <h1 className="hero-title" style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(40px, 7vw, 72px)",
            fontWeight: 900,
            lineHeight: 1.0,
            background: "linear-gradient(135deg, #fbbf24 0%, #f472b6 40%, #a855f7 70%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Guildie Games
          </h1>
          <p className="hero-desc" style={{
            fontSize: "16px", color: "var(--muted)", lineHeight: 1.7,
            maxWidth: "640px", margin: "0 auto 24px"
          }}>
            Think Guinness World Records &mdash; but for the Unity Guilds. Setting records, celebrating Guildies, and doing cool things on the platform together.
          </p>
        </div>

        {/* Rainbow Line */}
        <div className="rainbow-line" />

        {/* About Card */}
        <div className="about-card">
          <div className="about-title">{"\u2728"} How Guildie Games Works</div>
          <div className="about-text">
            Each month brings a new challenge across all five Unity Guilds. Compete as a guild, earn bragging rights, and win prizes. Every Guildie&apos;s contribution counts toward your guild&apos;s total!
          </div>
          <div className="prize-chips">
            <span className="prize-chip">{"\ud83c\udfae"} Game Keys</span>
            <span className="prize-chip">{"\u2b50"} Gifted Subs</span>
            <span className="prize-chip">{"\ud83c\udf81"} Monthly Surprises</span>
            <span className="prize-chip">{"\ud83c\udfc6"} Record Holder Status</span>
          </div>
        </div>

        {/* Prizes Section */}
        <div className="prizes-section">
          <div className="prizes-title">{"\ud83c\udf81"} Prize Pool</div>
          <div className="prizes-sub">Prizes are distributed to randomly selected participants from the winning Guild each month.</div>
          <div className="prizes-grid">
            <div className="prize-card">
              <div className="prize-icon">{"\ud83c\udfae"}</div>
              <div className="prize-name">Game Keys</div>
              <div className="prize-detail">Steam, Epic &amp; more</div>
            </div>
            <div className="prize-card">
              <div className="prize-icon">{"\u2b50"}</div>
              <div className="prize-name">Gifted Subs</div>
              <div className="prize-detail">Twitch subscriptions</div>
            </div>
            <div className="prize-card">
              <div className="prize-icon">{"\ud83c\udfc6"}</div>
              <div className="prize-name">Record Holder</div>
              <div className="prize-detail">Permanent recognition</div>
            </div>
            <div className="prize-card">
              <div className="prize-icon">{"\ud83c\udf81"}</div>
              <div className="prize-name">Monthly Surprise</div>
              <div className="prize-detail">Something special each month</div>
            </div>
          </div>
        </div>

        {/* Competition Timeline Label */}
        <div className="section-label">Competition Timeline</div>

        {/* Month Timeline */}
        <div className="month-timeline">
          {timeline.map((m) => (
            <div
              key={m.num}
              className={`month-pill ${m.status} ${activeMonth === m.num ? "active" : ""}`}
              onClick={() => showMonth(m.num)}
            >
              {m.icon ? `${m.icon} ` : ""}{m.label}
            </div>
          ))}
        </div>

        {/* Dynamic Month Content */}
        {timeline.map((month) => {
          if (month.status === "upcoming") return null;
          const leaderboard = getLeaderboard(month.num);
          const maxScore = leaderboard.length > 0 ? leaderboard[0].score : 1;
          const isCompleted = month.status === "completed";
          const isActive = month.status === "active";
          const winner = isCompleted && leaderboard.length > 0 ? leaderboard[0] : null;
          const scoreUnit = leaderboard.length > 0 ? leaderboard[0].scoreUnit : "points";

          return (
            <div key={month.num} className={`month-section ${activeMonth === month.num ? "active" : ""}`}>
              <div className="current-month-card">
                <div className="month-card-header">
                  <div className="month-badge">{isCompleted ? "\ud83c\udfc6" : "\ud83c\udfac"}</div>
                  <div>
                    <div className="month-info-top">
                      Month {month.num} &middot; {isCompleted ? "Completed" : "In Progress"}
                    </div>
                    <div className="month-comp-title">{month.data?.challenge_name || "Challenge"}</div>
                  </div>
                  {isCompleted ? (
                    <div className="active-badge" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" }}>
                      {"\u2705"} COMPLETED
                    </div>
                  ) : isActive ? (
                    <div className="active-badge">
                      <div className="active-dot" />
                      LIVE NOW
                    </div>
                  ) : null}
                </div>
                <div className="month-card-body">
                  {month.data?.description && (
                    <p className="month-desc">{month.data.description}</p>
                  )}
                  {!month.data?.description && isCompleted && (
                    <p className="month-desc">The results are in!</p>
                  )}
                  {!month.data?.description && isActive && (
                    <p className="month-desc">This challenge is live! Every contribution counts toward your guild&apos;s total.</p>
                  )}

                  <div className="scoreboard-title">
                    {isCompleted ? "\ud83c\udfc6 Final Standings" : "\ud83d\udcca Live Leaderboard"}
                  </div>

                  {leaderboard.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
                      No scores recorded yet for this month.
                    </div>
                  ) : (
                    <div className="scoreboard">
                      {leaderboard.map((row) => (
                        <div key={row.key} className={`score-row ${row.rowClass}`}>
                          <div className={`score-rank rank-${row.rank <= 3 ? row.rank : "other"}`}>{row.rank}</div>
                          <div className="score-guild-emoji">{row.emoji}</div>
                          <div className="score-guild-info">
                            <div className="score-guild-name">{row.name}</div>
                            <div className="score-bar-wrap">
                              <div
                                className={`score-bar ${row.key}-bar`}
                                style={{ width: `${maxScore > 0 ? (row.score / maxScore) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <div className="score-value">
                            {formatScore(row.score, row.scoreUnit)}
                            <span className="score-unit">{scoreUnit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Winner announcement for completed months */}
                  {isCompleted && winner && (
                    <div className="completed-card" style={{ marginTop: "20px" }}>
                      <div className="completed-header">
                        <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: "18px", fontWeight: 700 }}>
                          {winner.emoji} {winner.name} Wins Month {month.num}!
                        </div>
                        <div className="completed-badge">Record Holders</div>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>
                        Congratulations to {winner.name} for taking first place with {formatScore(winner.score, winner.scoreUnit)} {scoreUnit}!
                      </p>
                    </div>
                  )}

                  {/* How to participate for active months */}
                  {isActive && (
                    <div style={{
                      marginTop: "16px", padding: "14px 18px", borderRadius: "12px",
                      background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                      fontSize: "13px", color: "var(--muted)", lineHeight: 1.6
                    }}>
                      <strong style={{ color: "var(--text)" }}>How to participate:</strong> Check your guild&apos;s Discord server for details on the <strong style={{ color: "var(--gold)" }}>#guildie-games</strong> channel.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Bottom Rainbow Line */}
        <div className="rainbow-line" />

        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "14px", padding: "20px 0 40px" }}>
          More months coming soon! New challenges drop each month throughout 2026.
        </div>
      </div>
    </>
  );
}
