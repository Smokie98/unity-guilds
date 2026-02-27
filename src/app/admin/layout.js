"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUILDS, getLandingGuilds } from "@/lib/guilds";

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

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [selectedGuild, setSelectedGuild] = useState("women");
  const guildSlugs = getLandingGuilds();

  // Store selected guild in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("admin-guild");
    if (saved && GUILDS[saved]) setSelectedGuild(saved);
  }, []);

  function handleGuildChange(e) {
    setSelectedGuild(e.target.value);
    sessionStorage.setItem("admin-guild", e.target.value);
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
          onChange={handleGuildChange}
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
            \u2190 View {GUILDS[selectedGuild]?.shortName || "Guild"} Site
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        {/* Pass selectedGuild to children via a data attribute and script */}
        <div data-admin-guild={selectedGuild}>
          {typeof children === "function"
            ? children({ selectedGuild })
            : children}
        </div>
      </main>
    </div>
  );
}
