"use client";

import { useState } from "react";

export default function RecapsAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", date: "", summary: "", topics: "" });

  function handleSave() {
    alert("Recap saved! (Database connection needed)");
    setShowForm(false);
    setFormData({ title: "", date: "", summary: "", topics: "" });
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">\ud83c\udfdb\ufe0f Guild Hall Recaps</h1>
        <p className="admin-page-desc">Post summaries of monthly Guild Hall meetings so members can catch up.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "\ud83c\udfdb\ufe0f Add New Recap"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">New Recap</div>
          <div className="admin-form-group">
            <label className="admin-form-label">Title</label>
            <input type="text" className="admin-form-input" placeholder="e.g., February Guild Hall — Mentorship, Mental Health & Growth" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Meeting Date</label>
            <input type="date" className="admin-form-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ maxWidth: "200px" }} />
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
            <button className="admin-btn-primary" onClick={handleSave}>Save Recap</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">All Recaps</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Title</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>February 2026</td>
              <td>Mentorship, Mental Health &amp; Growth</td>
              <td style={{ color: "var(--muted)", fontSize: "13px" }}>Feb 10, 2026</td>
              <td><button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>Edit</button></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>January 2026</td>
              <td>2026 Goals &amp; New Year Vision</td>
              <td style={{ color: "var(--muted)", fontSize: "13px" }}>Jan 13, 2026</td>
              <td><button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
