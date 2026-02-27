"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAdminCrud, AdminToast } from "@/hooks/useAdminCrud";

// Dynamically import the editor to avoid SSR issues with Tiptap
const NewsletterEditor = dynamic(() => import("@/components/NewsletterEditor"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
      Loading editor...
    </div>
  ),
});

export default function NewsletterAdmin() {
  const { items: newsletters, loading, message, create, update, remove, clearMessage } = useAdminCrud("/api/newsletters");
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", issue_number: 1, published: false });

  function handleNew() {
    const nextIssue = newsletters.length > 0
      ? Math.max(...newsletters.map((n) => n.issue_number || 0)) + 1
      : 1;
    setFormData({ title: "", content: "", issue_number: nextIssue, published: false });
    setEditingId(null);
    setEditing(true);
  }

  function handleEdit(nl) {
    setFormData({
      title: nl.title || "",
      content: nl.content || "",
      issue_number: nl.issue_number || 1,
      published: nl.published || false,
    });
    setEditingId(nl.id);
    setEditing(true);
  }

  async function handleSave(publish) {
    try {
      const data = { ...formData, published: publish };
      if (editingId) {
        await update(editingId, data);
      } else {
        await create(data);
      }
      setEditing(false);
      setEditingId(null);
    } catch {}
  }

  async function handleDelete(id) {
    if (confirm("Delete this newsletter?")) {
      await remove(id);
    }
  }

  if (editing) {
    return (
      <>
        <AdminToast message={message} onClose={clearMessage} />
        <div className="admin-page-header">
          <h1 className="admin-page-title">{editingId ? "Edit Newsletter" : "New Newsletter"}</h1>
          <p className="admin-page-desc">Write and publish your newsletter using the rich text editor below.</p>
        </div>

        <div className="admin-card">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">Issue #</label>
              <input
                type="number"
                className="admin-form-input"
                value={formData.issue_number}
                onChange={(e) => setFormData({ ...formData, issue_number: parseInt(e.target.value) || 1 })}
                style={{ width: "80px", textAlign: "center" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                Status: <span style={{ color: formData.published ? "var(--success)" : "var(--warn)" }}>
                  {formData.published ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </div>

          <NewsletterEditor
            content={formData.content}
            onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            title={formData.title}
            onTitleChange={(title) => setFormData((prev) => ({ ...prev, title }))}
          />

          <div className="admin-btn-group" style={{ marginTop: "20px" }}>
            <button className="admin-btn-primary" onClick={() => handleSave(true)}>{"\ud83d\udce8"} Publish Newsletter</button>
            <button className="admin-btn-secondary" onClick={() => handleSave(false)}>{"\ud83d\udcbe"} Save as Draft</button>
            <button className="admin-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminToast message={message} onClose={clearMessage} />
      <div className="admin-page-header">
        <h1 className="admin-page-title">{"\ud83d\udcf0"} Newsletter</h1>
        <p className="admin-page-desc">Create, edit, and publish weekly newsletters for your guild.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn-primary" onClick={handleNew}>{"\u270f\ufe0f"} Create New Newsletter</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">All Newsletters</div>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : newsletters.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>No newsletters yet. Create your first one!</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {newsletters.map((nl) => (
                <tr key={nl.id}>
                  <td style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted)" }}>#{nl.issue_number}</td>
                  <td>{nl.title}</td>
                  <td><span className={`admin-badge ${nl.published ? "published" : "draft"}`}>{nl.published ? "published" : "draft"}</span></td>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{nl.published_at ? new Date(nl.published_at).toLocaleDateString() : new Date(nl.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="admin-btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleEdit(nl)}>Edit</button>
                      <button className="admin-btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => handleDelete(nl.id)}>Delete</button>
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
