"use client";

import { useState } from "react";
import { useAdminCrud, AdminToast } from "@/hooks/useAdminCrud";

export default function HighlightsAdmin() {
  const { items: highlights, loading, message, create, update, remove, clearMessage } = useAdminCrud("/api/highlights");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", event_type: "", event_date: "", description: "" });

  function handleNew() {
    setFormData({ title: "", event_type: "", event_date: "", description: "" });
    setEditingId(null);
    setShowForm(true);
  }

  function handleEdit(h) {
    setFormData({
      title: h.title || "",
      event_type: h.event_type || "",
      event_date: h.event_date || "",
      description: h.description || "",
    });
    setEditingId(h.id);
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
      setFormData({ title: "", event_type: "", event_date: "", description: "" });
    } catch {}
  }

  async function handleDelete(id) {
    if (confirm("Delete this highlight?")) {
      await remove(id);
    }
  }

  return (
    <>
      <AdminToast message={message} onClose={clearMessage} />

      <div className="admin-page-header">
        <h1 className="admin-page-title">{"\ud83c\udf1f"} Guild Highlights</h1>
        <p className="admin-page-desc">Showcase your guild&apos;s best moments with event highlight cards.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={showForm ? () => setShowForm(false) : handleNew}>
          {showForm ? "Cancel" : "\ud83c\udf1f Add New Highlight"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">{editingId ? "Edit Highlight" : "New Highlight"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Title</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Valentine's Charity Marathon — $2,400!" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Event Type</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Charity Stream, Game Night" value={formData.event_type} onChange={(e) => setFormData({ ...formData, event_type: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Date</label>
              <input type="text" className="admin-form-input" placeholder="e.g., FEB 10-14, 2026" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Description</label>
              <textarea className="admin-form-input" placeholder="Brief description of the highlight..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <div className="admin-btn-group">
            <button className="admin-btn-primary" onClick={handleSave}>{editingId ? "Update" : "Save"} Highlight</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">All Highlights</div>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : highlights.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>No highlights yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {highlights.map((h) => (
                <tr key={h.id}>
                  <td>{h.title}</td>
                  <td style={{ color: "var(--muted)" }}>{h.event_type}</td>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{h.event_date}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleEdit(h)}>Edit</button>
                      <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleDelete(h.id)}>Delete</button>
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
