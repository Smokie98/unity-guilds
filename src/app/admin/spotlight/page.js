"use client";

import { useState } from "react";
import { useAdminCrud, AdminToast } from "@/hooks/useAdminCrud";

export default function SpotlightAdmin() {
  const { items: spotlights, loading, message, create, update, remove, clearMessage } = useAdminCrud("/api/spotlight");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    member_name: "", member_handle: "", bio: "", twitch_url: "", achievement: "", featured_week: "", is_current: false,
  });

  const currentSpotlight = spotlights.find((s) => s.is_current);
  const pastSpotlights = spotlights.filter((s) => !s.is_current);

  function handleNew() {
    setFormData({ member_name: "", member_handle: "", bio: "", twitch_url: "", achievement: "", featured_week: "", is_current: true });
    setEditingId(null);
    setShowForm(true);
  }

  function handleEdit(s) {
    setFormData({
      member_name: s.member_name || "",
      member_handle: s.member_handle || "",
      bio: s.bio || "",
      twitch_url: s.twitch_url || "",
      achievement: s.achievement || "",
      featured_week: s.featured_week || "",
      is_current: s.is_current || false,
    });
    setEditingId(s.id);
    setShowForm(true);
  }

  async function handleSave() {
    try {
      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
      setShowForm(false);
      setEditingId(null);
    } catch {}
  }

  async function handleDelete(id) {
    if (confirm("Delete this spotlight?")) {
      await remove(id);
    }
  }

  return (
    <>
      <AdminToast message={message} onClose={clearMessage} />

      <div className="admin-page-header">
        <h1 className="admin-page-title">{"\u2728"} Guildie Spotlight</h1>
        <p className="admin-page-desc">Feature a guild member each week. Set the current spotlight and manage past ones.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={showForm ? () => setShowForm(false) : handleNew}>
          {showForm ? "Cancel" : "\u2728 Set This Week's Spotlight"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">{editingId ? "Edit Spotlight" : "New Spotlight"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Member Name</label>
              <input type="text" className="admin-form-input" placeholder="e.g., StreamerRose" value={formData.member_name} onChange={(e) => setFormData({ ...formData, member_name: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Handle</label>
              <input type="text" className="admin-form-input" placeholder="e.g., @streamingrose on Twitch" value={formData.member_handle} onChange={(e) => setFormData({ ...formData, member_handle: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Twitch URL</label>
              <input type="text" className="admin-form-input" placeholder="https://twitch.tv/..." value={formData.twitch_url} onChange={(e) => setFormData({ ...formData, twitch_url: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Week Label</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Week of February 18, 2026" value={formData.featured_week} onChange={(e) => setFormData({ ...formData, featured_week: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Bio / Description</label>
              <textarea className="admin-form-input" placeholder="Tell us about this guildie..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Achievement</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Charity Stream Coordinator" value={formData.achievement} onChange={(e) => setFormData({ ...formData, achievement: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-checkbox">
                <input type="checkbox" checked={formData.is_current} onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })} />
                <span>Set as Current Spotlight</span>
              </label>
            </div>
          </div>
          <div className="admin-btn-group">
            <button className="admin-btn-primary" onClick={handleSave}>{"\u2728"} {editingId ? "Update" : "Save"} Spotlight</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Current Spotlight */}
      <div className="admin-card">
        <div className="admin-card-title">Current Spotlight</div>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : currentSpotlight ? (
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(145,70,255,0.3), rgba(244,114,182,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
              {"\ud83c\udf38"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>{currentSpotlight.member_name}</div>
              <div style={{ fontSize: "13px", color: "var(--muted)" }}>{currentSpotlight.member_handle}</div>
              <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>{currentSpotlight.featured_week}</div>
            </div>
            <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleEdit(currentSpotlight)}>Edit</button>
          </div>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>No current spotlight set.</div>
        )}
      </div>

      {/* Past Spotlights */}
      <div className="admin-card">
        <div className="admin-card-title">Past Spotlights</div>
        {pastSpotlights.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>No past spotlights.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Member</th><th>Week</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pastSpotlights.map((s) => (
                <tr key={s.id}>
                  <td>{s.member_name}</td>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{s.featured_week || new Date(s.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleEdit(s)}>Edit</button>
                      <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
