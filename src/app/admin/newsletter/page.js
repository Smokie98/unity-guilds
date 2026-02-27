"use client";

import { useState } from "react";

// Sample drafts — will be replaced with Supabase data
const SAMPLE_NEWSLETTERS = [
  { id: 1, title: "Guild Hall February Recap, Charity Stream Week & Spring Event Lineup!", issueNum: 52, status: "published", date: "Feb 18, 2026" },
  { id: 2, title: "Valentine's Event Wrap-Up & Raid Train Success", issueNum: 51, status: "published", date: "Feb 11, 2026" },
  { id: 3, title: "Spring Event Planning Draft", issueNum: 53, status: "draft", date: "Feb 20, 2026" },
];

export default function NewsletterAdmin() {
  const [newsletters] = useState(SAMPLE_NEWSLETTERS);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", issueNum: 53 });

  function handleNew() {
    setFormData({ title: "", content: "", issueNum: 53 });
    setEditing(true);
  }

  function handleSave() {
    // Will save to Supabase in production
    alert("Newsletter saved! (Database connection needed)");
    setEditing(false);
  }

  if (editing) {
    return (
      <>
        <div className="admin-page-header">
          <h1 className="admin-page-title">{formData.title ? "Edit Newsletter" : "New Newsletter"}</h1>
          <p className="admin-page-desc">Write and publish your weekly newsletter using the editor below.</p>
        </div>

        <div className="admin-card">
          <div className="admin-form-group">
            <label className="admin-form-label">Issue Number</label>
            <input
              type="number"
              className="admin-form-input"
              value={formData.issueNum}
              onChange={(e) => setFormData({ ...formData, issueNum: e.target.value })}
              style={{ maxWidth: "120px" }}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Title</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Enter newsletter title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Content</label>
            <div style={{ marginBottom: "8px", fontSize: "12px", color: "var(--muted)" }}>
              Tiptap WYSIWYG editor will be connected here. For now, use the text area below.
            </div>
            <textarea
              className="admin-form-input"
              placeholder="Write your newsletter content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{ minHeight: "400px" }}
            />
          </div>
          <div className="admin-btn-group">
            <button className="admin-btn-primary" onClick={handleSave}>
              \ud83d\udce8 Publish Newsletter
            </button>
            <button className="admin-btn-secondary" onClick={handleSave}>
              \ud83d\udcbe Save as Draft
            </button>
            <button className="admin-btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">\ud83d\udcf0 Newsletter</h1>
        <p className="admin-page-desc">Create, edit, and publish weekly newsletters for your guild.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={handleNew}>
          \u270f\ufe0f Create New Newsletter
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">All Newsletters</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((nl) => (
              <tr key={nl.id}>
                <td style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted)" }}>#{nl.issueNum}</td>
                <td>{nl.title}</td>
                <td><span className={`admin-badge ${nl.status}`}>{nl.status}</span></td>
                <td style={{ color: "var(--muted)", fontSize: "13px" }}>{nl.date}</td>
                <td>
                  <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => { setFormData({ title: nl.title, content: "", issueNum: nl.issueNum }); setEditing(true); }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
