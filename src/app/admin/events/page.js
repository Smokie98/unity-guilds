"use client";

import { useState } from "react";

const SAMPLE_EVENTS = [
  { id: 1, title: "Game Night: Jackbox Party Pack", date: "2026-02-22", time: "7:00 PM EST", location: "Discord Voice" },
  { id: 2, title: "Streamer Workshop: Branding 101", date: "2026-02-28", time: "5:00 PM EST", location: "Discord Stage" },
  { id: 3, title: "Networking Coffee Hour", date: "2026-03-01", time: "10:00 AM EST", location: "Discord Voice" },
  { id: 4, title: "Guild Hall Meeting — March", date: "2026-03-15", time: "7:00 PM EST", location: "Discord Stage" },
];

export default function EventsAdmin() {
  const [events] = useState(SAMPLE_EVENTS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", date: "", time: "", location: "", description: "" });

  function handleSave() {
    alert("Event saved! (Database connection needed)");
    setShowForm(false);
    setFormData({ title: "", date: "", time: "", location: "", description: "" });
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">\ud83d\udcc5 Events</h1>
        <p className="admin-page-desc">Manage upcoming events for your guild. Events appear on the guild page calendar.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "\u2795 Add New Event"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">New Event</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-form-label">Event Title</label>
              <input type="text" className="admin-form-input" placeholder="e.g., Game Night: Jackbox" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Date</label>
              <input type="date" className="admin-form-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Time</label>
              <input type="text" className="admin-form-input" placeholder="e.g., 7:00 PM EST" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
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
            <button className="admin-btn-primary" onClick={handleSave}>\ud83d\udcc5 Save Event</button>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">Upcoming Events</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt) => (
              <tr key={evt.id}>
                <td>{evt.title}</td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>{evt.date}</td>
                <td style={{ fontSize: "13px" }}>{evt.time}</td>
                <td style={{ color: "var(--muted)", fontSize: "13px" }}>{evt.location}</td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>Edit</button>
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
