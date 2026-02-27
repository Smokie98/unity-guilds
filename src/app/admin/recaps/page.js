"use client";

import { useState } from "react";
import { useAdminCrud, AdminToast } from "@/hooks/useAdminCrud";

export default function RecapsAdmin() {
  const { items: recaps, loading, message, create, update, remove, clearMessage } = useAdminCrud("/api/recaps");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", meeting_date: "", summary: "", topics: "" });

  function handleNew() {
    setFormData({ title: "", meeting_date: "", summary: "", topics: "" });
    setEditingId(null);
    setShowForm(true);
  }

  function handleEdit(r) {
    setFormData({
      title: r.title || "",
      meeting_date: r.meeting_date || "",
      summary: r.summary || "",
      topics: (r.topics || []).join(", "),
    });
    setEditingId(r.id);
    setShowForm(true);
  }

  async function handleSave() {
    try {
      const data = {
        ...formData,
        topics: formData.topics ? formData.topics.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        await update(editingId, data);
      } else {
        await create(data);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: "", meeting_date: "", summary: "", topics: "" });
    } catch {}
  }

  async function handleDelete(id) {
    if (confirm("Delete this recap?")) {
      await remove(id);
    }
  }

  return (
    <>
      <AdminToast message={message} onClose={clearMessage} />

      <div className="admin-page-header">
        <h1 className="admin-page-title">{"\ud83c\udfdb\ufe0f"} Guild Hall Recaps</h1>
        <p className="admin-page-desc">Post summaries of monthly Guild Hall meetings so members can catch up.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={showForm ? () => setShowForm(false) : handleNew}>
          {showForm ? "Cancel" : "\ud83c\udfdb\ufe0f Add New Recap"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">{editingId ? "Edit Recap" : "New Recap"}</div>
          <div className="admin-form-group">
            <label className="admin-form-label">Title</label>
            <input type="text" className="admin-form-input" placeholder="e.g., February Guild Hall — Mentorship, Mental Health & Growth" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Meeting Date</label>
            <input type="date" className="admin-form-input" value={formData.meeting_date} onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })} style={{ maxWidth: "200px" }} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Summary</label>
            <textarea className="admin-form-input" placeholder="Brief summary of what was discussed..." value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Topics (comma-separated)</label>
            <input type="text" className="admin-form-input" placeholder="e.g., Mentorship Program, Mental Health, 120 Attendees" value={formData.topics} onChange={(e) => setFormData({ ...formData, topics: e.target.value })} />
          </div>
          <div className="admin-btn-group">
            <button className="admin-btn-primary" onClick={handleSave}>{editingId ? "Update" : "Save"} Recap</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">All Recaps</div>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : recaps.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>No recaps yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {recaps.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{r.meeting_date || new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleEdit(r)}>Edit</button>
                      <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleDelete(r.id)}>Delete</button>
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
