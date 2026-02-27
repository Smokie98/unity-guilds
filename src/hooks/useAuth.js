"use client";

import { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children, initialSession }) {
  const [user, setUser] = useState(initialSession || null);
  const [loading, setLoading] = useState(!initialSession);

  useEffect(() => {
    // If no initial session was provided, try to get it from the API
    if (!initialSession) {
      fetch("/api/auth/session")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) setUser(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialSession]);

  function loginWithDiscord(guildSlug) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${siteUrl}/api/auth/callback`);
    const state = guildSlug || "";
    const scope = encodeURIComponent("identify guilds guilds.members.read");

    window.location.href =
      `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
  }

  function logout() {
    fetch("/api/auth/logout", { method: "POST" })
      .then(() => {
        setUser(null);
        window.location.href = "/";
      })
      .catch(console.error);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithDiscord, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
