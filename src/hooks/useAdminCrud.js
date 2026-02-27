"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminGuild } from "@/contexts/AdminGuildContext";

// Generic CRUD hook for admin pages
// endpoint: base API path like "/api/events"
export function useAdminCrud(endpoint) {
  const { selectedGuild } = useAdminGuild();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // success/error toast

  // Fetch items for the selected guild
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${endpoint}?guild=${selectedGuild}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, selectedGuild]);

  // Fetch on mount and when guild changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Create a new item
  async function create(data) {
    setMessage(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guild: selectedGuild, ...data }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create");
      }

      const newItem = await res.json();
      setMessage({ type: "success", text: "Created successfully!" });
      await refresh();
      return newItem;
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      throw err;
    }
  }

  // Update an existing item
  async function update(id, data) {
    setMessage(null);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update");
      }

      const updated = await res.json();
      setMessage({ type: "success", text: "Updated successfully!" });
      await refresh();
      return updated;
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      throw err;
    }
  }

  // Delete an item
  async function remove(id) {
    setMessage(null);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete");
      }

      setMessage({ type: "success", text: "Deleted successfully!" });
      await refresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      throw err;
    }
  }

  // Clear the message toast
  function clearMessage() {
    setMessage(null);
  }

  return {
    items,
    loading,
    error,
    message,
    create,
    update,
    remove,
    refresh,
    clearMessage,
    selectedGuild,
  };
}

// Toast component for success/error messages
export function AdminToast({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "12px 20px",
        borderRadius: "12px",
        background: message.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
        border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        color: message.type === "success" ? "#22c55e" : "#ef4444",
        fontSize: "14px",
        fontWeight: 500,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backdropFilter: "blur(10px)",
        animation: "fadeInDown 0.3s ease-out",
      }}
    >
      <span>{message.type === "success" ? "\u2705" : "\u274c"}</span>
      {message.text}
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          padding: "0 0 0 8px",
          fontSize: "16px",
        }}
      >
        \u00d7
      </button>
    </div>
  );
}
