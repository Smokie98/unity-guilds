"use client";

import { useState } from "react";

const GUILDS_LIST = [
  { key: "women", name: "Women's Unity Guild", emoji: "\ud83d\udc9c" },
  { key: "black", name: "The Black Guild", emoji: "\ud83d\udda4" },
  { key: "latin", name: "Latin Guild", emoji: "\ud83e\udde1" },
  { key: "pride", name: "Pride Guild", emoji: "\ud83c\udf08" },
  { key: "ia", name: "Indigenous Alliance", emoji: "\ud83e\udeb6" },
];

export default function GamesAdmin() {
  const [activeMonth, setActiveMonth] = useState(2);
  const [scores, setScores] = useState({
    women: 47, black: 38, ia: 30, pride: 22, latin: 16,
  });

  function updateScore(guild, value) {
    setScores((prev) => ({ ...prev, [guild]: parseInt(value) || 0 }));
  }

  function handleSave() {
    alert("Scores saved! (Database connection needed)");
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">\ud83c\udfc6 Guildie Games</h1>
        <p className="admin-page-desc">Manage competition months, challenges, and scores across all guilds.</p>
      </div>

      {/* Month Selector */}
      <div className="admin-card">
        <div className="admin-card-title">Active Month</div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
            <button
              key={m}
              className={m === activeMonth ? "admin-btn-primary" : "admin-btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "13px" }}
              onClick={() => setActiveMonth(m)}
            >
              M{m}
            </button>
          ))}
        </div>
      </div>

      {/* Score Editor */}
      <div className="admin-card">
        <div className="admin-card-title">
          Month {activeMonth} Scores {activeMonth === 2 ? "(Most Clips Submitted)" : activeMonth === 1 ? "(Longest VC — Completed)" : "(TBA)"}
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
                value={scores[guild.key] || 0}
                onChange={(e) => updateScore(guild.key, e.target.value)}
                min="0"
              />
            </div>
          ))}
        </div>
        <div className="admin-btn-group">
          <button className="admin-btn-primary" onClick={handleSave}>
            \ud83d\udcbe Save All Scores
          </button>
        </div>
      </div>

      {/* Challenge Name Editor */}
      <div className="admin-card">
        <div className="admin-card-title">Month {activeMonth} Challenge</div>
        <div className="admin-form-group">
          <label className="admin-form-label">Challenge Name</label>
          <input
            type="text"
            className="admin-form-input"
            defaultValue={activeMonth === 1 ? "Longest VC Session" : activeMonth === 2 ? "Most Clips Submitted" : "TBA"}
          />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Status</label>
          <select className="admin-form-select" defaultValue={activeMonth === 1 ? "completed" : activeMonth === 2 ? "active" : "upcoming"}>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active (Live)</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="admin-btn-group">
          <button className="admin-btn-primary">Save Challenge</button>
        </div>
      </div>
    </>
  );
}
