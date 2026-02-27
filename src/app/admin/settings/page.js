"use client";

import { useState } from "react";

export default function SettingsAdmin() {
  const [colors, setColors] = useState({
    primary: "#9146FF",
    secondary: "#C084FC",
    accent: "#F472B6",
  });

  const [sections, setSections] = useState([
    { id: "home", label: "Home", visible: true },
    { id: "newsletter", label: "Newsletter", visible: true },
    { id: "archive", label: "Archive", visible: true },
    { id: "announcements", label: "Announcements", visible: true },
    { id: "events", label: "Events", visible: true },
    { id: "spotlight", label: "Guildie Spotlight", visible: true },
    { id: "recaps", label: "Guild Hall Recaps", visible: true },
    { id: "highlights", label: "Guild Highlights", visible: true },
    { id: "streams", label: "Live Streams", visible: true },
  ]);

  function toggleSection(id) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  }

  function handleSaveColors() {
    alert("Colors saved! (Database connection needed)");
  }

  function handleSaveSections() {
    alert("Section visibility saved! (Database connection needed)");
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">\u2699\ufe0f Site Settings</h1>
        <p className="admin-page-desc">Customize your guild&apos;s theme colors and manage which sections are visible.</p>
      </div>

      {/* Theme Colors */}
      <div className="admin-card">
        <div className="admin-card-title">\ud83c\udfa8 Theme Colors</div>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
          Change your guild&apos;s colors. These apply to the entire guild page including cards, buttons, and borders.
        </p>

        <div className="color-picker-row">
          <input
            type="color"
            className="color-picker-swatch"
            value={colors.primary}
            onChange={(e) => setColors({ ...colors, primary: e.target.value })}
          />
          <div>
            <div className="color-picker-label">Primary Color</div>
            <div className="color-picker-value">{colors.primary}</div>
          </div>
        </div>

        <div className="color-picker-row">
          <input
            type="color"
            className="color-picker-swatch"
            value={colors.secondary}
            onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
          />
          <div>
            <div className="color-picker-label">Secondary Color</div>
            <div className="color-picker-value">{colors.secondary}</div>
          </div>
        </div>

        <div className="color-picker-row">
          <input
            type="color"
            className="color-picker-swatch"
            value={colors.accent}
            onChange={(e) => setColors({ ...colors, accent: e.target.value })}
          />
          <div>
            <div className="color-picker-label">Accent Color</div>
            <div className="color-picker-value">{colors.accent}</div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{
          marginTop: "20px", padding: "20px", borderRadius: "16px",
          background: `linear-gradient(145deg, ${colors.primary}1A, ${colors.accent}0D)`,
          border: `1px solid ${colors.primary}33`,
        }}>
          <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
            Preview
          </div>
          <div style={{
            display: "inline-block", padding: "8px 16px", borderRadius: "10px",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            color: "white", fontSize: "13px", fontWeight: 600,
          }}>
            Sample Button
          </div>
          <div style={{
            marginTop: "12px", padding: "12px", borderRadius: "10px",
            border: `1px solid ${colors.secondary}33`, fontSize: "13px", color: colors.secondary,
          }}>
            This is how text with the secondary color looks.
          </div>
        </div>

        <div className="admin-btn-group">
          <button className="admin-btn-primary" onClick={handleSaveColors}>
            \ud83d\udcbe Save Colors
          </button>
          <button className="admin-btn-secondary" onClick={() => setColors({ primary: "#9146FF", secondary: "#C084FC", accent: "#F472B6" })}>
            Reset to Default
          </button>
        </div>
      </div>

      {/* Section Visibility */}
      <div className="admin-card">
        <div className="admin-card-title">\ud83d\udccb Section Manager</div>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
          Toggle which sections are visible on your guild page. Hidden sections won&apos;t appear in the sidebar navigation.
        </p>

        <div style={{ display: "grid", gap: "8px" }}>
          {sections.map((section) => (
            <div key={section.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", background: "rgba(255,255,255,0.02)",
              borderRadius: "10px", border: "1px solid var(--border)",
            }}>
              <span style={{ fontWeight: 500, fontSize: "14px" }}>{section.label}</span>
              <label className="admin-form-checkbox" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={section.visible}
                  onChange={() => toggleSection(section.id)}
                />
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {section.visible ? "Visible" : "Hidden"}
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="admin-btn-group">
          <button className="admin-btn-primary" onClick={handleSaveSections}>
            \ud83d\udcbe Save Sections
          </button>
        </div>
      </div>

      {/* Font Settings */}
      <div className="admin-card">
        <div className="admin-card-title">\ud83d\udcdd Font Settings</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Heading Font</label>
            <select className="admin-form-select" defaultValue="Playfair Display">
              <option>Playfair Display</option>
              <option>Merriweather</option>
              <option>Lora</option>
              <option>Crimson Text</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Body Font</label>
            <select className="admin-form-select" defaultValue="DM Sans">
              <option>DM Sans</option>
              <option>Inter</option>
              <option>Nunito</option>
              <option>Open Sans</option>
            </select>
          </div>
        </div>
        <div className="admin-btn-group">
          <button className="admin-btn-primary">\ud83d\udcbe Save Fonts</button>
        </div>
      </div>
    </>
  );
}
