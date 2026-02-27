"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GUILDS, getLandingGuilds } from "@/lib/guilds";
import { canAccessAdmin } from "@/lib/permissions";
import { AdminGuildProvider, useAdminGuild } from "@/contexts/AdminGuildContext";

const NAV_ITEMS = [
  { href: "/admin", icon: "\ud83d\udcca", label: "Overview" },
  { divider: true },
  { href: "/admin/newsletter", icon: "\ud83d\udcf0", label: "Newsletter" },
  { href: "/admin/events", icon: "\ud83d\udcc5", label: "Events" },
  { href: "/admin/announcements", icon: "\ud83d\udce3", label: "Announcements" },
  { href: "/admin/spotlight", icon: "\u2728", label: "Guildie Spotlight" },
  { divider: true },
  { href: "/admin/recaps", icon: "\ud83c\udfdb\ufe0f", label: "Guild Hall Recaps" },
  { href: "/admin/highlights", icon: "\ud83c\udf1f", label: "Highlights" },
  { href: "/admin/games", icon: "\ud83c\udfc6", label: "Guildie Games" },
  { divider: true },
  { href: "/admin/settings", icon: "\u2699\ufe0f", label: "Site Settings" },
];

function AdminContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedGuild, setSelectedGuild, user, loading } = useAdminGuild();
  const guildSlugs = getLandingGuilds();

  // Auth guard — redirect non-admins
  useEffect(() => {
    if (!loading && (!user || !canAccessAdmin(user))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0a0a0a",
        color: "#888",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚙️</div>
          <div>Verifying admin access...</div>
        </div>
      </div>
    );
  }

  if (!user || !canAccessAdmin(user)) {
    return null;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">Unity Guilds Admin</div>
          <div className="admin-sidebar-sub">Content Management</div>
        </div>

        {/* Guild Picker */}
        <select
          className="admin-guild-picker"
          value={selectedGuild}
          onChange={(e) => setSelectedGuild(e.target.value)}
        >
          {guildSlugs.map((slug) => (
            <option key={slug} value={slug}>
              {GUILDS[slug].emoji} {GUILDS[slug].name}
            </option>
          ))}
        </select>

        {/* Navigation */}
        <nav className="admin-nav">
          {NAV_ITEMS.map((item, i) => {
            if (item.divider) return <div key={`d${i}`} className="admin-nav-divider" />;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href={`/${selectedGuild}`} className="admin-back-link">
            ← View {GUILDS[selectedGuild]?.shortName || "Guild"} Site
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminGuildProvider>
      <AdminContent>{children}</AdminContent>
    </AdminGuildProvider>
  );
}
