"use client";

import { useState } from "react";
import Link from "next/link";

// Sample scores — will be replaced with Supabase data in Step 9
const INITIAL_SCORES = {
  women: 47,
  black: 38,
  ia: 30,
  pride: 22,
  latin: 16,
};

const MONTH1_RESULTS = [
  { guild: "black", name: "The Black Guild", emoji: "\ud83d\udda4", value: "147h 32m", pct: 100 },
  { guild: "women", name: "Women's Unity Guild", emoji: "\ud83d\udc9c", value: "105h 18m", pct: 71 },
  { guild: "pride", name: "Pride Guild", emoji: "\ud83c\udf08", value: "81h 04m", pct: 55 },
  { guild: "latin", name: "Latin Guild", emoji: "\ud83e\udde1", value: "62h 11m", pct: 42 },
  { guild: "ia", name: "Indigenous Alliance", emoji: "\ud83e\udeb6", value: "44h 20m", pct: 30 },
];

const GUILD_ROW_CLASSES = {
  women: "women",
  black: "black-g",
  latin: "latin",
  pride: "pride",
  ia: "ia",
};

const MONTHS = [
  { num: 1, label: "Month 1 \u2014 Longest VC", status: "completed", icon: "\u2705" },
  { num: 2, label: "Month 2 \u2014 Most Clips", status: "active", icon: "\ud83d\udfe1" },
  { num: 3, label: "Month 3 \u2014 TBA", status: "upcoming" },
  { num: 4, label: "Month 4 \u2014 TBA", status: "upcoming" },
  { num: 5, label: "Month 5 \u2014 TBA", status: "upcoming" },
  { num: 6, label: "Month 6 \u2014 TBA", status: "upcoming" },
  { num: 7, label: "Month 7 \u2014 TBA", status: "upcoming" },
  { num: 8, label: "Month 8 \u2014 TBA", status: "upcoming" },
  { num: 9, label: "Month 9 \u2014 TBA", status: "upcoming" },
  { num: 10, label: "Month 10 \u2014 TBA", status: "upcoming" },
  { num: 11, label: "Month 11 \u2014 TBA", status: "upcoming" },
  { num: 12, label: "Month 12 \u2014 TBA", status: "upcoming" },
];

const GUILD_INFO = {
  women: { name: "Women's Unity Guild", emoji: "\ud83d\udc9c" },
  black: { name: "The Black Guild", emoji: "\ud83d\udda4" },
  ia: { name: "Indigenous Alliance", emoji: "\ud83e\udeb6" },
  pride: { name: "Pride Guild", emoji: "\ud83c\udf08" },
  latin: { name: "Latin Guild", emoji: "\ud83e\udde1" },
};

export default function GuildieGamesPage() {
  const [activeMonth, setActiveMonth] = useState(2);
  const [scores, setScores] = useState(INITIAL_SCORES);
  const [showModal, setShowModal] = useState(false);
  const [editingGuild, setEditingGuild] = useState(null);
  const [editValue, setEditValue] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  function showMonth(num) {
    if (MONTHS[num - 1].status === "upcoming") return;
    setActiveMonth(num);
  }

  function openEdit(guildKey, guildName, current) {
    setEditingGuild({ key: guildKey, name: guildName });
    setEditValue(current);
    setShowModal(true);
  }

  function saveScore() {
    if (editingGuild) {
      setScores((prev) => ({ ...prev, [editingGuild.key]: parseInt(editValue) || 0 }));
      setShowModal(false);
      setEditingGuild(null);
    }
  }

  // Sort guilds by score for Month 2 leaderboard
  const sortedGuilds = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([key, score], idx) => ({
      key,
      score,
      rank: idx + 1,
      ...GUILD_INFO[key],
      rowClass: GUILD_ROW_CLASSES[key],
    }));

  const maxScore = sortedGuilds.length > 0 ? sortedGuilds[0].score : 1;

  // Enable admin mode with keyboard shortcut
  if (typeof window !== "undefined") {
    // This will be replaced with proper auth in Step 8
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
          \u2190 All Guilds
        </Link>

        {/* Hero */}
        <div className="hero" style={{ textAlign: "center", marginBottom: "60px" }}>
          <div className="hero-trophy">\ud83c\udfc6</div>
          <div className="hero-label" style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px"
          }}>
            Cross-Guild Competition \u00b7 Year One
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
          <div className="about-title">\u2728 How Guildie Games Works</div>
          <div className="about-text">
            Each month brings a new challenge across all five Unity Guilds. Compete as a guild, earn bragging rights, and win prizes. Every Guildie&apos;s contribution counts toward your guild&apos;s total!
          </div>
          <div className="prize-chips">
            <span className="prize-chip">\ud83c\udfae Game Keys</span>
            <span className="prize-chip">\u2b50 Gifted Subs</span>
            <span className="prize-chip">\ud83c\udf81 Monthly Surprises</span>
            <span className="prize-chip">\ud83c\udfc6 Record Holder Status</span>
          </div>
        </div>

        {/* Prizes Section */}
        <div className="prizes-section">
          <div className="prizes-title">\ud83c\udf81 Prize Pool</div>
          <div className="prizes-sub">Prizes are distributed to randomly selected participants from the winning Guild each month.</div>
          <div className="prizes-grid">
            <div className="prize-card">
              <div className="prize-icon">\ud83c\udfae</div>
              <div className="prize-name">Game Keys</div>
              <div className="prize-detail">Steam, Epic &amp; more</div>
            </div>
            <div className="prize-card">
              <div className="prize-icon">\u2b50</div>
              <div className="prize-name">Gifted Subs</div>
              <div className="prize-detail">Twitch subscriptions</div>
            </div>
            <div className="prize-card">
              <div className="prize-icon">\ud83c\udfc6</div>
              <div className="prize-name">Record Holder</div>
              <div className="prize-detail">Permanent recognition</div>
            </div>
            <div className="prize-card">
              <div className="prize-icon">\ud83c\udf81</div>
              <div className="prize-name">Monthly Surprise</div>
              <div className="prize-detail">Something special each month</div>
            </div>
          </div>
        </div>

        {/* Competition Timeline Label */}
        <div className="section-label">Competition Timeline</div>

        {/* Month Timeline */}
        <div className="month-timeline">
          {MONTHS.map((m) => (
            <div
              key={m.num}
              className={`month-pill ${m.status} ${activeMonth === m.num ? "active" : ""}`}
              onClick={() => showMonth(m.num)}
            >
              {m.icon ? `${m.icon} ` : ""}{m.label}
            </div>
          ))}
        </div>

        {/* Month 1 Content */}
        <div className={`month-section ${activeMonth === 1 ? "active" : ""}`}>
          <div className="current-month-card">
            <div className="month-card-header">
              <div className="month-badge">\ud83c\udfc6</div>
              <div>
                <div className="month-info-top">Month 1 \u00b7 Completed</div>
                <div className="month-comp-title">Longest VC Session</div>
              </div>
              <div className="active-badge" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" }}>
                \u2705 COMPLETED
              </div>
            </div>
            <div className="month-card-body">
              <p className="month-desc">Which guild could rack up the most voice chat hours? The results are in!</p>
              <div className="scoreboard-title">\ud83c\udfc6 Final Standings</div>
              <div className="scoreboard">
                {MONTH1_RESULTS.map((row, i) => (
                  <div key={row.guild} className={`score-row ${GUILD_ROW_CLASSES[row.guild]}`}>
                    <div className={`score-rank rank-${i < 3 ? i + 1 : "other"}`}>{i + 1}</div>
                    <div className="score-guild-emoji">{row.emoji}</div>
                    <div className="score-guild-info">
                      <div className="score-guild-name">{row.name}</div>
                      <div className="score-bar-wrap">
                        <div className={`score-bar ${row.guild}-bar`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                    <div className="score-value">
                      {row.value}
                      <span className="score-unit">VC Hours</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Winner announcement */}
              <div className="completed-card" style={{ marginTop: "20px" }}>
                <div className="completed-header">
                  <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: "18px", fontWeight: 700 }}>
                    \ud83d\udda4 The Black Guild Wins Month 1!
                  </div>
                  <div className="completed-badge">Record Holders</div>
                </div>
                <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>
                  Shoutout to everyone in The Black Guild VC channels! 147 hours and 32 minutes of hanging out, gaming, and vibing together. That&apos;s a record.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Month 2 Content */}
        <div className={`month-section ${activeMonth === 2 ? "active" : ""}`}>
          <div className="current-month-card">
            <div className="month-card-header">
              <div className="month-badge">\ud83c\udfac</div>
              <div>
                <div className="month-info-top">Month 2 \u00b7 In Progress</div>
                <div className="month-comp-title">Most Clips Submitted</div>
              </div>
              <div className="active-badge">
                <div className="active-dot" />
                LIVE NOW
              </div>
            </div>
            <div className="month-card-body">
              <p className="month-desc">
                Submit your best Twitch clips to #guildie-games-clips on Discord. Every clip from a guild member counts toward your guild&apos;s total!
              </p>
              <div className="scoreboard-title">\ud83d\udcca Live Leaderboard</div>
              <div className={`scoreboard ${isAdmin ? "is-admin" : ""}`}>
                {sortedGuilds.map((row) => (
                  <div key={row.key} className={`score-row ${row.rowClass}`}>
                    <div className={`score-rank rank-${row.rank <= 3 ? row.rank : "other"}`}>{row.rank}</div>
                    <div className="score-guild-emoji">{row.emoji}</div>
                    <div className="score-guild-info">
                      <div className="score-guild-name">{row.name}</div>
                      <div className="score-bar-wrap">
                        <div
                          className={`score-bar ${row.key}-bar`}
                          style={{ width: `${(row.score / maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="score-value">
                      {row.score}
                      <span className="score-unit">clips submitted</span>
                    </div>
                    <div className="score-edit-btn" onClick={() => openEdit(row.key, row.name, row.score)}>
                      \u270f\ufe0f
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: "16px", padding: "14px 18px", borderRadius: "12px",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                fontSize: "13px", color: "var(--muted)", lineHeight: 1.6
              }}>
                <strong style={{ color: "var(--text)" }}>How to submit:</strong> Post your Twitch clips in the <strong style={{ color: "var(--gold)" }}>#guildie-games-clips</strong> channel on your guild&apos;s Discord server.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rainbow Line */}
        <div className="rainbow-line" />

        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "14px", padding: "20px 0 40px" }}>
          More months coming soon! New challenges drop each month throughout 2026.
        </div>
      </div>

      {/* Edit Modal */}
      <div className={`modal-overlay ${showModal ? "show" : ""}`} onClick={() => setShowModal(false)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-title">Update Score</div>
          <div className="modal-sub">
            {editingGuild ? `Update clip count for: ${editingGuild.name}` : "Enter new clip count"}
          </div>
          <input
            type="number"
            className="modal-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="0"
            min="0"
          />
          <div className="modal-actions">
            <button className="modal-save" onClick={saveScore}>Save Score</button>
            <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}
