"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * InlineEditor — wraps any text element and allows admins to click-to-edit.
 *
 * Props:
 * - value: current text value
 * - onSave: async (newValue) => void — called when user saves
 * - canEdit: boolean — whether editing is allowed (check user role)
 * - as: element tag to render (default: "span")
 * - multiline: boolean — use textarea instead of input
 * - className: CSS classes for the display element
 * - style: inline styles for the display element
 * - placeholder: placeholder text when value is empty
 * - children: optional children to render instead of value
 */
export default function InlineEditor({
  value,
  onSave,
  canEdit = false,
  as: Tag = "span",
  multiline = false,
  className = "",
  style = {},
  placeholder = "Click to edit...",
  children,
}) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Select all text
      if (inputRef.current.select) inputRef.current.select();
    }
  }, [editing]);

  const handleStartEdit = useCallback(() => {
    if (!canEdit) return;
    setTempValue(value || "");
    setEditing(true);
  }, [canEdit, value]);

  const handleSave = useCallback(async () => {
    if (tempValue === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(tempValue);
      setEditing(false);
    } catch {
      // Keep editing open on error
    } finally {
      setSaving(false);
    }
  }, [tempValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setTempValue(value || "");
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }, [handleSave, handleCancel, multiline]);

  // Not editable — just render normally
  if (!canEdit) {
    return (
      <Tag className={className} style={style}>
        {children || value || ""}
      </Tag>
    );
  }

  // Editing mode — show input/textarea with save/cancel
  if (editing) {
    return (
      <div className="inline-editor-wrap" ref={wrapRef}>
        {/* Floating toolbar */}
        <div className="inline-toolbar">
          <button
            className="inline-toolbar-btn save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "..." : "\u2714"} Save
          </button>
          <button
            className="inline-toolbar-btn cancel"
            onClick={handleCancel}
            disabled={saving}
          >
            {"\u2718"} Cancel
          </button>
          {multiline && (
            <span className="inline-toolbar-hint">Ctrl+Enter to save</span>
          )}
        </div>
        {multiline ? (
          <textarea
            ref={inputRef}
            className="inline-editor-input multiline"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            className="inline-editor-input"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
          />
        )}
      </div>
    );
  }

  // Display mode — show content with edit hint on hover
  return (
    <Tag
      className={`${className} inline-editable`}
      style={{ ...style, cursor: "pointer" }}
      onClick={handleStartEdit}
      onMouseEnter={() => setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
      title="Click to edit"
    >
      {children || value || <span className="inline-placeholder">{placeholder}</span>}
      {showHint && (
        <span className="inline-edit-hint">{"\u270f\ufe0f"}</span>
      )}
    </Tag>
  );
}
