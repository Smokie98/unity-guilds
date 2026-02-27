"use client";

import { useState } from "react";
import { useAdminCrud, AdminToast } from "@/hooks/useAdminCrud";

export default function AnnouncementsAdmin() {
  const { items: announcements, loading, message, create, update, remove, clearMessage } = useAdminCrud("/api/announcements");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", pinned: false });

  function handleNew() {
    setFormData({ title: "", content: "", pinned: false });
    setEditingId(null);
    setShowForm(true);
  }

  function handleEdit(ann) {
    setFormData({ title: ann.title || "", content: ann.content || "", pinned: ann.pinned || false });
    setEditingId(ann.id);
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
      setFormData({ title: "", content: "", pinned: false });
    } catch {}
  }

  async function handleTogglePin(ann) {
    await update(ann.id, { pinned: !ann.pinned });
  }

  async function handleDelete(id) {
    if (confirm("Delete this announcement?")) {
      await remove(id);
    }
  }

  return (
    <>
      <AdminToast message={message} onClose={clearMessage} />

      <div className="admin-page-header">
        <h1 className="admin-page-title">{"\ud83d\udce3"} Announcements</h1>
        <p className="admin-page-desc">Post announcements for your guild. Pinned announcements appear at the top.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={showForm ? () => setShowForm(false) : handleNew}>
          {showForm ? "Cancel" : "\ud83d\udce3 Post Announcement"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">{editingId ? "Edit Announcement" : "New Announcement"}</div>
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
            <button className="admin-btn-primary" onClick={handleSave}>{"\ud83d\udce3"} {editingId ? "Update" : "Post"}</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">All Announcements</div>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : announcements.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>No announcements yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {announcements.map((ann) => (
                <tr key={ann.id}>
                  <td>{ann.icon} {ann.title}</td>
                  <td>{ann.pinned ? <span className="admin-badge pinned">Pinned</span> : <span className="admin-badge draft">Active</span>}</td>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{new Date(ann.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleTogglePin(ann)}>{ann.pinned ? "Unpin" : "Pin"}</button>
                      <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleEdit(ann)}>Edit</button>
                      <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleDelete(ann.id)}>Delete</button>
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
