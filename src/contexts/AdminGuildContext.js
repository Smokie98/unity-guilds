"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { GUILDS, getLandingGuilds } from "@/lib/guilds";

const AdminGuildContext = createContext(null);

export function AdminGuildProvider({ children }) {
  const [selectedGuild, setSelectedGuild] = useState("women");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved guild from sessionStorage and fetch user session
  useEffect(() => {
    const saved = sessionStorage.getItem("admin-guild");
    if (saved && GUILDS[saved]) setSelectedGuild(saved);

    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  function changeGuild(slug) {
    setSelectedGuild(slug);
    sessionStorage.setItem("admin-guild", slug);
  }

  return (
    <AdminGuildContext.Provider
      value={{ selectedGuild, setSelectedGuild: changeGuild, user, loading }}
    >
      {children}
    </AdminGuildContext.Provider>
  );
}

export function useAdminGuild() {
  const ctx = useContext(AdminGuildContext);
  if (!ctx) {
    throw new Error("useAdminGuild must be used within AdminGuildProvider");
  }
  return ctx;
}
