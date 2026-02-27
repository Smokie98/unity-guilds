"use client";

import { useState } from "react";

export default function SpotlightAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", handle: "", bio: "", twitchUrl: "", achievement: "", week: "",
  });

  function handleSave() {
    alert("Spotlight saved! (Database connection needed)");
    setShowForm(false);
    setFormData({ name: "", handle: "", bio: "", twitchUrl: "", achievement: "", week: "" });
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">\u2728 Guildie Spotlight</h1>
        <p className="admin-page-desc">Feature a guild member each week. Set the current spotlight and manage past ones.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "\u2728 Set This Week's Spotlight"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">New Spotlight</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Member Name</label>
              <input type="text" className="admin-form-input" placeholder="e.g., StreamerRose" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Handle</label>
              <input type="text" className="admin-form-input" placeholder="e.g., @streamingrose on Twitch" value={formData.handle} onChange={(e) => setFormData({ ...formData, handle: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Twitch URL</label>
              <input type="text" className="admin-form-input" placeholder="https://twitch.tv/..." value={formData.twitchUrl} onChange={(e) => setFormData({ ...formData, twitchUrl: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Week Label</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Week of February 18, 2026" value={formData.week} onChange={(e) => setFormData({ ...formData, week: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Bio / Description</label>
              <textarea className="admin-form-input" placeholder="Tell us about this guildie..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Achievement</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Charity Stream Coordinator — $2,400 Raised" value={formData.achievement} onChange={(e) => setFormData({ ...formData, achievement: e.target.value })} />
            </div>
          </div>
          <div className="admin-btn-group">
            <button className="admin-btn-primary" onClick={handleSave}>\u2728 Set as Current Spotlight</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Current Spotlight */}
      <div className="admin-card">
        <div className="admin-card-title">Current Spotlight</div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(145,70,255,0.3), rgba(244,114,182,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
            \ud83c\udf38
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "16px" }}>StreamerRose</div>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>@streamingrose on Twitch</div>
            <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>Week of February 18, 2026</div>
          </div>
        </div>
      </div>

      {/* Past Spotlights */}
      <div className="admin-card">
        <div className="admin-card-title">Past Spotlights</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Week</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GamingWithLuna</td>
              <td style={{ color: "var(--muted)", fontSize: "13px" }}>Feb 11, 2026</td>
              <td><button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>Edit</button></td>
            </tr>
            <tr>
              <td>PixelQueenSara</td>
              <td style={{ color: "var(--muted)", fontSize: "13px" }}>Feb 04, 2026</td>
              <td><button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
