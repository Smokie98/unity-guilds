"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminGuild } from "@/contexts/AdminGuildContext";

export default function AdminOverview() {
  const { selectedGuild } = useAdminGuild();
  const [stats, setStats] = useState({ newsletters: 0, events: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [nlRes, evRes, annRes] = await Promise.all([
          fetch(`/api/newsletters?guild=${selectedGuild}`),
          fetch(`/api/events?guild=${selectedGuild}`),
          fetch(`/api/announcements?guild=${selectedGuild}`),
        ]);

        const [newsletters, events, announcements] = await Promise.all([
          nlRes.ok ? nlRes.json() : [],
          evRes.ok ? evRes.json() : [],
          annRes.ok ? annRes.json() : [],
        ]);

        setStats({
          newsletters: Array.isArray(newsletters) ? newsletters.length : 0,
          events: Array.isArray(events) ? events.length : 0,
          announcements: Array.isArray(announcements) ? announcements.length : 0,
        });
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [selectedGuild]);

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-desc">Welcome to the Unity Guilds admin panel. Manage content for your guild from here.</p>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{loading ? "..." : stats.newsletters}</div>
          <div className="admin-stat-label">Newsletters</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{loading ? "..." : stats.events}</div>
          <div className="admin-stat-label">Upcoming Events</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{loading ? "..." : stats.announcements}</div>
          <div className="admin-stat-label">Announcements</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">M2</div>
          <div className="admin-stat-label">Guildie Games Month</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-title">Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          <Link href="/admin/newsletter" className="admin-btn-primary" style={{ textAlign: "center", textDecoration: "none" }}>
            {"\u270f\ufe0f"} Create Newsletter
          </Link>
          <Link href="/admin/events" className="admin-btn-secondary" style={{ textAlign: "center", textDecoration: "none" }}>
            {"\ud83d\udcc5"} Add Event
          </Link>
          <Link href="/admin/spotlight" className="admin-btn-secondary" style={{ textAlign: "center", textDecoration: "none" }}>
            {"\u2728"} Set Spotlight
          </Link>
          <Link href="/admin/announcements" className="admin-btn-secondary" style={{ textAlign: "center", textDecoration: "none" }}>
            {"\ud83d\udce3"} Post Announcement
          </Link>
        </div>
      </div>
    </>
  );
}
