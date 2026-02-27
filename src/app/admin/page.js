"use client";

import Link from "next/link";

export default function AdminOverview() {
  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-desc">Welcome to the Unity Guilds admin panel. Manage content for your guild from here.</p>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-value">52</div>
          <div className="admin-stat-label">Newsletters Published</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">4</div>
          <div className="admin-stat-label">Upcoming Events</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">4</div>
          <div className="admin-stat-label">Active Announcements</div>
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
            \u270f\ufe0f Create Newsletter
          </Link>
          <Link href="/admin/events" className="admin-btn-secondary" style={{ textAlign: "center", textDecoration: "none" }}>
            \ud83d\udcc5 Add Event
          </Link>
          <Link href="/admin/spotlight" className="admin-btn-secondary" style={{ textAlign: "center", textDecoration: "none" }}>
            \u2728 Set Spotlight
          </Link>
          <Link href="/admin/announcements" className="admin-btn-secondary" style={{ textAlign: "center", textDecoration: "none" }}>
            \ud83d\udce3 Post Announcement
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-card">
        <div className="admin-card-title">Recent Activity</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Item</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>\ud83d\udcf0 Newsletter</td>
              <td>Issue #52 Published</td>
              <td><span className="admin-badge published">Published</span></td>
              <td>Feb 18, 2026</td>
            </tr>
            <tr>
              <td>\ud83d\udce3 Announcement</td>
              <td>Guild Hall Meeting March</td>
              <td><span className="admin-badge pinned">Pinned</span></td>
              <td>Feb 18, 2026</td>
            </tr>
            <tr>
              <td>\u2728 Spotlight</td>
              <td>StreamerRose Featured</td>
              <td><span className="admin-badge published">Active</span></td>
              <td>Feb 18, 2026</td>
            </tr>
            <tr>
              <td>\ud83d\udcc5 Event</td>
              <td>Game Night Added</td>
              <td><span className="admin-badge draft">Upcoming</span></td>
              <td>Feb 16, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
