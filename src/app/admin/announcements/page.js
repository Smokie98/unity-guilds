"use client";

import { useState } from "react";

const SAMPLE_ANNOUNCEMENTS = [
  { id: 1, title: "Guild Hall Meeting — March 2026", content: "Monthly meeting March 15th at 7 PM EST.", icon: "\ud83d\udccc", pinned: true, date: "Feb 18, 2026" },
  { id: 2, title: "Mentorship Program Opens March 1st", content: "Applications open March 1st!", icon: "\ud83d\udccc", pinned: true, date: "Feb 18, 2026" },
  { id: 3, title: "Guildie Games Month 2 Is Live!", content: "Submit clips in #guildie-games-clips!", icon: "\ud83c\udfc6", pinned: false, date: "Feb 16, 2026" },
  { id: 4, title: "Charity Stream — $2,400 Raised!", content: "Together we raised $2,400!", icon: "\ud83c\udf89", pinned: false, date: "Feb 16, 2026" },
];

export default function AnnouncementsAdmin() {
  const [announcements] = useState(SAMPLE_ANNOUNCEMENTS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", pinned: false });

  function handleSave() {
    alert("Announcement saved! (Database connection needed)");
    setShowForm(false);
    setFormData({ title: "", content: "", pinned: false });
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">\ud83d\udce3 Announcements</h1>
        <p className="admin-page-desc">Post announcements for your guild. Pinned announcements appear at the top.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "\ud83d\udce3 Post Announcement"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">New Announcement</div>
          <div className="admin-form-group">
            <label className="admin-form-label">Title</label>
            <input type="text" className="admin-form-input" placeholder="Announcement title..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Content</label>
            <textarea className="admin-form-input" placeholder="Announcement details..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-checkbox">
              <input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })} />
              <span>Pin this announcement</span>
            </label>
          </div>
          <div className="admin-btn-group">
            <button className="admin-btn-primary" onClick={handleSave}>\ud83d\udce3 Post</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">All Announcements</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((ann) => (
              <tr key={ann.id}>
                <td>{ann.icon} {ann.title}</td>
                <td>{ann.pinned ? <span className="admin-badge pinned">Pinned</span> : <span className="admin-badge draft">Active</span>}</td>
                <td style={{ color: "var(--muted)", fontSize: "13px" }}>{ann.date}</td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>{ann.pinned ? "Unpin" : "Pin"}</button>
                    <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
