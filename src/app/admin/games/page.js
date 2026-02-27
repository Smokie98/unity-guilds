"use client";

import { useState, useEffect } from "react";
import { useAdminGuild } from "@/contexts/AdminGuildContext";
import { AdminToast } from "@/hooks/useAdminCrud";

const GUILDS_LIST = [
  { key: "women", name: "Women's Unity Guild", emoji: "\ud83d\udc9c" },
  { key: "black", name: "The Black Guild", emoji: "\ud83d\udda4" },
  { key: "latin", name: "Latin Guild", emoji: "\ud83e\udde1" },
  { key: "pride", name: "Pride Guild", emoji: "\ud83c\udf08" },
  { key: "ia", name: "Indigenous Alliance", emoji: "\ud83e\udeb6" },
];

export default function GamesAdmin() {
  const { user } = useAdminGuild();
  const [months, setMonths] = useState([]);
  const [scores, setScores] = useState([]);
  const [activeMonth, setActiveMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [challengeName, setChallengeName] = useState("");
  const [challengeStatus, setChallengeStatus] = useState("upcoming");
  const [localScores, setLocalScores] = useState({});

  // Fetch games data
  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      try {
        const res = await fetch("/api/games");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMonths(data.months || []);
        setScores(data.scores || []);

        // Set active month to the first active or latest month
        const active = data.months.find((m) => m.status === "active") || data.months[0];
        if (active) {
          setActiveMonth(active);
          setChallengeName(active.challenge_name);
          setChallengeStatus(active.status);

          // Set local scores for this month
          const monthScores = {};
          (data.scores || [])
            .filter((s) => s.month_id === active.id)
            .forEach((s) => { monthScores[s.guild] = s.score; });
          setLocalScores(monthScores);
        }
      } catch (err) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  function selectMonth(month) {
    setActiveMonth(month);
    setChallengeName(month.challenge_name);
    setChallengeStatus(month.status);
    const monthScores = {};
    scores
      .filter((s) => s.month_id === month.id)
      .forEach((s) => { monthScores[s.guild] = s.score; });
    setLocalScores(monthScores);
  }

  async function handleSaveScores() {
    if (!activeMonth) return;
    try {
      const scoreUpdates = GUILDS_LIST.map((g) => ({
        month_id: activeMonth.id,
        guild: g.key,
        score: localScores[g.key] || 0,
        score_unit: activeMonth.month_number === 1 ? "VC Hours" : activeMonth.month_number === 2 ? "clips submitted" : "points",
      }));

      const res = await fetch("/api/games", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          months: [{
            id: activeMonth.id,
            challenge_name: challengeName,
            status: challengeStatus,
            start_date: activeMonth.start_date,
            end_date: activeMonth.end_date,
          }],
          scores: scoreUpdates,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: "Scores and challenge saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  if (loading) {
    return (
      <>
        <div className="admin-page-header">
          <h1 className="admin-page-title">{"\ud83c\udfc6"} Guildie Games</h1>
          <p className="admin-page-desc">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminToast message={message} onClose={() => setMessage(null)} />

      <div className="admin-page-header">
        <h1 className="admin-page-title">{"\ud83c\udfc6"} Guildie Games</h1>
        <p className="admin-page-desc">Manage competition months, challenges, and scores across all guilds.</p>
      </div>

      {/* Month Selector */}
      <div className="admin-card">
        <div className="admin-card-title">Select Month</div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {months.map((m) => (
            <button
              key={m.id}
              className={activeMonth?.id === m.id ? "admin-btn-primary" : "admin-btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "13px" }}
              onClick={() => selectMonth(m)}
            >
              M{m.month_number} {m.status === "active" ? "\ud83d\udfe2" : m.status === "completed" ? "\u2705" : ""}
            </button>
          ))}
        </div>
      </div>

      {activeMonth && (
        <>
          {/* Score Editor */}
          <div className="admin-card">
            <div className="admin-card-title">
              Month {activeMonth.month_number} Scores ({challengeName})
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {GUILDS_LIST.map((guild) => (
                <div key={guild.key} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "20px" }}>{guild.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{guild.name}</span>
                  <input
                    type="number"
                    className="admin-form-input"
                    style={{ width: "100px", textAlign: "center" }}
                    value={localScores[guild.key] || 0}
                    onChange={(e) => setLocalScores({ ...localScores, [guild.key]: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Challenge Editor */}
          <div className="admin-card">
            <div className="admin-card-title">Month {activeMonth.month_number} Challenge</div>
            <div className="admin-form-group">
              <label className="admin-form-label">Challenge Name</label>
              <input type="text" className="admin-form-input" value={challengeName} onChange={(e) => setChallengeName(e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Status</label>
              <select className="admin-form-select" value={challengeStatus} onChange={(e) => setChallengeStatus(e.target.value)}>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active (Live)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <button className="admin-btn-primary" onClick={handleSaveScores}>
              {"\ud83d\udcbe"} Save All Changes
            </button>
          </div>
        </>
      )}
    </>
  );
}
