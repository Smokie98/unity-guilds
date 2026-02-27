"use client";

import { useState } from "react";
import { useAdminCrud, AdminToast } from "@/hooks/useAdminCrud";

export default function EventsAdmin() {
  const { items: events, loading, message, create, update, remove, clearMessage } = useAdminCrud("/api/events");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", event_date: "", event_time: "", location: "", description: "" });

  function handleNew() {
    setFormData({ title: "", event_date: "", event_time: "", location: "", description: "" });
    setEditingId(null);
    setShowForm(true);
  }

  function handleEdit(evt) {
    setFormData({
      title: evt.title || "",
      event_date: evt.event_date || "",
      event_time: evt.event_time || "",
      location: evt.location || "",
      description: evt.description || "",
    });
    setEditingId(evt.id);
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
      setFormData({ title: "", event_date: "", event_time: "", location: "", description: "" });
    } catch {}
  }

  async function handleDelete(id) {
    if (confirm("Delete this event?")) {
      await remove(id);
    }
  }

  return (
    <>
      <AdminToast message={message} onClose={clearMessage} />

      <div className="admin-page-header">
        <h1 className="admin-page-title">{"\ud83d\udcc5"} Events</h1>
        <p className="admin-page-desc">Manage upcoming events for your guild. Events appear on the guild page calendar.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={showForm ? () => setShowForm(false) : handleNew}>
          {showForm ? "Cancel" : "\u2795 Add New Event"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">{editingId ? "Edit Event" : "New Event"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Event Title</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Game Night: Jackbox" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Date</label>
              <input type="date" className="admin-form-input" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Time</label>
              <input type="text" className="admin-form-input" placeholder="e.g., 7:00 PM EST" value={formData.event_time} onChange={(e) => setFormData({ ...formData, event_time: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Location</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Discord Voice" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Description</label>
              <textarea className="admin-form-input" placeholder="Event description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <div className="admin-btn-group">
            <button className="admin-btn-primary" onClick={handleSave}>{"\ud83d\udcc5"} {editingId ? "Update" : "Save"} Event</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">Upcoming Events</div>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>No events yet. Create your first event!</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Event</th><th>Date</th><th>Time</th><th>Location</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id}>
                  <td>{evt.title}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>{evt.event_date}</td>
                  <td style={{ fontSize: "13px" }}>{evt.event_time}</td>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{evt.location}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleEdit(evt)}>Edit</button>
                      <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleDelete(evt.id)}>Delete</button>
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
