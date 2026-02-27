"use client";

import { useState, useCallback } from "react";

/**
 * Hook for inline editing of content fields.
 * @param {string} endpoint - API endpoint base (e.g., "/api/newsletters")
 * @param {string|number} id - Record ID
 * @param {string} field - Field name to edit (e.g., "title", "content")
 */
export function useInlineEdit(endpoint, id, field) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tempContent, setTempContent] = useState("");

  const startEdit = useCallback((currentValue) => {
    setTempContent(currentValue || "");
    setIsEditing(true);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    setIsEditing(false);
    setTempContent("");
    setError(null);
  }, []);

  const save = useCallback(async (newValue) => {
    if (!id || !endpoint) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setIsEditing(false);
      setTempContent("");
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [endpoint, id, field]);

  return {
    isEditing,
    saving,
    error,
    tempContent,
    setTempContent,
    startEdit,
    save,
    cancel,
  };
}
