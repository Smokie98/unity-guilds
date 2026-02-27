"use client";

import { useState } from "react";

export default function HighlightsAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", eventType: "", date: "", description: "" });

  function handleSave() {
    alert("Highlight saved! (Database connection needed)");
    setShowForm(false);
    setFormData({ title: "", eventType: "", date: "", description: "" });
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">\ud83c\udf1f Guild Highlights</h1>
        <p className="admin-page-desc">Showcase your guild&apos;s best moments with event highlight cards.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "\ud83c\udf1f Add New Highlight"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">New Highlight</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Title</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Valentine's Charity Marathon — $2,400!" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Event Type</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Charity Stream, Game Night, Guild Hall" value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Date</label>
              <input type="text" className="admin-form-input" placeholder="e.g., FEB 10-14, 2026" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Description</label>
              <textarea className="admin-form-input" placeholder="Brief description of the highlight..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <div className="admin-btn-group">
            <button className="admin-btn-primary" onClick={handleSave}>Save Highlight</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">All Highlights</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Valentine&apos;s Charity Marathon — $2,400!</td>
              <td style={{ color: "var(--muted)" }}>Charity Stream</td>
              <td style={{ color: "var(--muted)", fontSize: "13px" }}>Feb 10-14, 2026</td>
              <td>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>Edit</button>
                  <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }}>Delete</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>January Game Night — 80 Players!</td>
              <td style={{ color: "var(--muted)" }}>Game Night</td>
              <td style={{ color: "var(--muted)", fontSize: "13px" }}>Jan 25, 2026</td>
              <td>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>Edit</button>
                  <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }}>Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
