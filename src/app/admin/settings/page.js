"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminGuild } from "@/contexts/AdminGuildContext";
import { AdminToast } from "@/hooks/useAdminCrud";
import { GUILDS } from "@/lib/guilds";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DEFAULT_SECTIONS = [
  { id: "home", label: "Home", icon: "\ud83c\udfe0" },
  { id: "newsletter", label: "Newsletter", icon: "\ud83d\udcf0" },
  { id: "archive", label: "Archive", icon: "\ud83d\udcda" },
  { id: "announcements", label: "Announcements", icon: "\ud83d\udce3" },
  { id: "events", label: "Events", icon: "\ud83d\udcc5" },
  { id: "spotlight", label: "Guildie Spotlight", icon: "\u2728" },
  { id: "recaps", label: "Guild Hall Recaps", icon: "\ud83c\udfdb\ufe0f" },
  { id: "highlights", label: "Guild Highlights", icon: "\ud83c\udf1f" },
  { id: "streams", label: "Live Streams", icon: "\ud83c\udfae" },
];

// Sortable section row
function SortableSectionRow({ section, onToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: isDragging ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.02)",
    borderRadius: "10px",
    border: isDragging ? "1px solid rgba(251,191,36,0.3)" : "1px solid var(--border)",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: "grab",
            padding: "4px 6px",
            fontSize: "16px",
            color: "var(--muted)",
            userSelect: "none",
          }}
          title="Drag to reorder"
        >
          {"\u2630"}
        </div>
        <span style={{ fontSize: "16px" }}>{section.icon}</span>
        <span style={{ fontWeight: 500, fontSize: "14px" }}>{section.label}</span>
      </div>
      <label className="admin-form-checkbox" style={{ margin: 0 }}>
        <input
          type="checkbox"
          checked={section.visible}
          onChange={() => onToggle(section.id)}
        />
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
          {section.visible ? "Visible" : "Hidden"}
        </span>
      </label>
    </div>
  );
}

export default function SettingsAdmin() {
  const { selectedGuild } = useAdminGuild();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const guildDefaults = GUILDS[selectedGuild]?.colors || {};
  const [colors, setColors] = useState({
    primary: guildDefaults.primary || "#9146FF",
    secondary: guildDefaults.secondary || "#C084FC",
    accent: guildDefaults.accent || "#F472B6",
  });

  const [sections, setSections] = useState(
    DEFAULT_SECTIONS.map((s) => ({ ...s, visible: true }))
  );

  const [headingFont, setHeadingFont] = useState("Playfair Display");
  const [bodyFont, setBodyFont] = useState("DM Sans");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch settings when guild changes
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await fetch(`/api/settings?guild=${selectedGuild}`);
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();

        if (data.theme_colors && Object.keys(data.theme_colors).length > 0) {
          setColors({
            primary: data.theme_colors.primary || guildDefaults.primary || "#9146FF",
            secondary: data.theme_colors.secondary || guildDefaults.secondary || "#C084FC",
            accent: data.theme_colors.accent || guildDefaults.accent || "#F472B6",
          });
        } else {
          setColors({
            primary: guildDefaults.primary || "#9146FF",
            secondary: guildDefaults.secondary || "#C084FC",
            accent: guildDefaults.accent || "#F472B6",
          });
        }

        // Restore section order + visibility
        const savedOrder = data.section_order || [];
        const savedVisibility = data.section_visibility || {};
        if (savedOrder.length > 0) {
          // Reorder based on saved order, add any missing sections at the end
          const ordered = [];
          savedOrder.forEach((id) => {
            const def = DEFAULT_SECTIONS.find((s) => s.id === id);
            if (def) {
              ordered.push({ ...def, visible: savedVisibility[id] !== false });
            }
          });
          // Add sections not in saved order
          DEFAULT_SECTIONS.forEach((def) => {
            if (!ordered.find((s) => s.id === def.id)) {
              ordered.push({ ...def, visible: savedVisibility[def.id] !== false });
            }
          });
          setSections(ordered);
        } else if (Object.keys(savedVisibility).length > 0) {
          setSections(
            DEFAULT_SECTIONS.map((s) => ({
              ...s,
              visible: savedVisibility[s.id] !== false,
            }))
          );
        }

        if (data.heading_font) setHeadingFont(data.heading_font);
        if (data.body_font) setBodyFont(data.body_font);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [selectedGuild]);

  function toggleSection(id) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  }

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSections((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  async function handleSaveColors() {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guild: selectedGuild, theme_colors: colors }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: "Colors saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleSaveSections() {
    try {
      const visibility = {};
      const order = [];
      sections.forEach((s) => {
        visibility[s.id] = s.visible;
        order.push(s.id);
      });
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guild: selectedGuild, section_visibility: visibility, section_order: order }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: "Section order and visibility saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleSaveFonts() {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guild: selectedGuild, heading_font: headingFont, body_font: bodyFont }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: "Font settings saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  if (loading) {
    return (
      <>
        <div className="admin-page-header">
          <h1 className="admin-page-title">{"\u2699\ufe0f"} Site Settings</h1>
          <p className="admin-page-desc">Loading settings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminToast message={message} onClose={() => setMessage(null)} />

      <div className="admin-page-header">
        <h1 className="admin-page-title">{"\u2699\ufe0f"} Site Settings</h1>
        <p className="admin-page-desc">Customize your guild&apos;s theme colors, reorder sections, and manage visibility.</p>
      </div>

      {/* Theme Colors */}
      <div className="admin-card">
        <div className="admin-card-title">{"\ud83c\udfa8"} Theme Colors</div>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
          Change your guild&apos;s colors. These apply to the entire guild page.
        </p>

        <div className="color-picker-row">
          <input type="color" className="color-picker-swatch" value={colors.primary} onChange={(e) => setColors({ ...colors, primary: e.target.value })} />
          <div>
            <div className="color-picker-label">Primary Color</div>
            <div className="color-picker-value">{colors.primary}</div>
          </div>
        </div>

        <div className="color-picker-row">
          <input type="color" className="color-picker-swatch" value={colors.secondary} onChange={(e) => setColors({ ...colors, secondary: e.target.value })} />
          <div>
            <div className="color-picker-label">Secondary Color</div>
            <div className="color-picker-value">{colors.secondary}</div>
          </div>
        </div>

        <div className="color-picker-row">
          <input type="color" className="color-picker-swatch" value={colors.accent} onChange={(e) => setColors({ ...colors, accent: e.target.value })} />
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
          <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Preview</div>
          <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: "10px", background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`, color: "white", fontSize: "13px", fontWeight: 600 }}>
            Sample Button
          </div>
          <div style={{ marginTop: "12px", padding: "12px", borderRadius: "10px", border: `1px solid ${colors.secondary}33`, fontSize: "13px", color: colors.secondary }}>
            This is how text with the secondary color looks.
          </div>
        </div>

        <div className="admin-btn-group">
          <button className="admin-btn-primary" onClick={handleSaveColors}>{"\ud83d\udcbe"} Save Colors</button>
          <button className="admin-btn-secondary" onClick={() => {
            const defaults = GUILDS[selectedGuild]?.colors || {};
            setColors({ primary: defaults.primary || "#9146FF", secondary: defaults.secondary || "#C084FC", accent: defaults.accent || "#F472B6" });
          }}>Reset to Default</button>
        </div>
      </div>

      {/* Section Manager with Drag & Drop */}
      <div className="admin-card">
        <div className="admin-card-title">{"\ud83d\udccb"} Section Manager</div>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
          Drag the {"\u2630"} handle to reorder sections. Toggle visibility with the checkbox. Changes affect the guild page sidebar and section order.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div style={{ display: "grid", gap: "8px" }}>
              {sections.map((section) => (
                <SortableSectionRow
                  key={section.id}
                  section={section}
                  onToggle={toggleSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="admin-btn-group">
          <button className="admin-btn-primary" onClick={handleSaveSections}>{"\ud83d\udcbe"} Save Section Order</button>
        </div>
      </div>

      {/* Font Settings */}
      <div className="admin-card">
        <div className="admin-card-title">{"\ud83d\udcdd"} Font Settings</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Heading Font</label>
            <select className="admin-form-select" value={headingFont} onChange={(e) => setHeadingFont(e.target.value)}>
              <option>Playfair Display</option>
              <option>Merriweather</option>
              <option>Lora</option>
              <option>Crimson Text</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Body Font</label>
            <select className="admin-form-select" value={bodyFont} onChange={(e) => setBodyFont(e.target.value)}>
              <option>DM Sans</option>
              <option>Inter</option>
              <option>Nunito</option>
              <option>Open Sans</option>
            </select>
          </div>
        </div>
        <div className="admin-btn-group">
          <button className="admin-btn-primary" onClick={handleSaveFonts}>{"\ud83d\udcbe"} Save Fonts</button>
        </div>
      </div>
    </>
  );
}
