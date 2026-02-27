"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getGuild, GUILDS } from "@/lib/guilds";
import { useGuildData } from "@/hooks/useGuildData";
import AddToCalendar from "@/components/AddToCalendar";
import SearchPanel from "@/components/SearchPanel";
import InlineEditor from "@/components/InlineEditor";
import { canEdit, canAccessAdmin } from "@/lib/permissions";

const NAV_ITEMS = [
  { id: "home", icon: "\ud83c\udfe0", label: "Home" },
  { id: "newsletter", icon: "\ud83d\udcf0", label: "Newsletter" },
  { id: "archive", icon: "\ud83d\udcda", label: "Archive" },
  { id: "divider1", divider: true },
  { id: "announcements", icon: "\ud83d\udce3", label: "Announcements" },
  { id: "events", icon: "\ud83d\udcc5", label: "Events" },
  { id: "spotlight", icon: "\u2728", label: "Guildie Spotlight" },
  { id: "divider2", divider: true },
  { id: "recaps", icon: "\ud83c\udfdb\ufe0f", label: "Guild Hall Recaps" },
  { id: "highlights", icon: "\ud83c\udf1f", label: "Guild Highlights" },
  { id: "streams", icon: "\ud83c\udfae", label: "Live Streams" },
  { id: "divider3", divider: true },
  { id: "games-link", icon: "\ud83c\udfc6", label: "Guildie Games", external: true },
  { id: "admin", icon: "\u2699\ufe0f", label: "Admin Panel" },
];

// Helper: format a date string to "FEB 18, 2026" style
function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

// Helper: format a date string to "FEBRUARY 18, 2026" style
function formatDateLong(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Helper: format a date string to "FEBRUARY 2026" style
function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Helper: format "Feb 11, 2026" style
function formatDateMedium(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Helper: parse event_date to day and month parts
function parseEventDate(dateStr) {
  if (!dateStr) return { day: "", month: "" };
  const d = new Date(dateStr + "T00:00:00");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: months[d.getMonth()],
  };
}

// Helper: get the month name for calendar header
function getCalendarMonthName(year, month) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[month]} ${year}`;
}

// Helper: get number of days in a month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper: estimate read time from content
function estimateReadTime(content) {
  if (!content) return "3 min read";
  const words = content.split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export default function GuildPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.guild;
  const guild = getGuild(slug);
  const [activeSection, setActiveSection] = useState("home");
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [popupDay, setPopupDay] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);

  // Calendar state - start at the current month
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Fetch real data from Supabase
  const {
    newsletters,
    latestNewsletter,
    events,
    announcements,
    spotlight,
    pastSpotlights,
    recaps,
    highlights,
    settings,
    loading: dataLoading,
  } = useGuildData(slug);

  // Check if user can inline-edit content
  const userCanEdit = user ? canEdit(user, slug) : false;

  // Generic inline save handler — calls PUT on the appropriate API endpoint
  async function inlineSave(endpoint, id, field, newValue) {
    const res = await fetch(`${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: newValue }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save");
    }
    return res.json();
  }

  // Check authentication — redirect to landing page if not logged in
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        setUser(data);
        setAuthChecked(true);
      })
      .catch(() => {
        // Not logged in — send back to landing page
        router.push("/");
      });
  }, [router]);

  // If guild not found, redirect to home
  useEffect(() => {
    if (!guild) {
      router.push("/");
    }
  }, [guild, router]);

  // Build ordered nav items based on settings.section_order
  // (Must be before any early returns to satisfy React rules of hooks)
  const orderedNavItems = useMemo(() => {
    const sectionOrder = settings?.section_order;
    const sectionVisibility = settings?.section_visibility;
    if (!sectionOrder || sectionOrder.length === 0) return NAV_ITEMS;

    // Build reordered items based on saved order
    const ordered = [];
    sectionOrder.forEach((id) => {
      // Skip hidden sections
      if (sectionVisibility && sectionVisibility[id] === false) return;
      const item = NAV_ITEMS.find((n) => n.id === id);
      if (item) ordered.push(item);
    });
    // Add any items not in the saved order (like dividers, admin, games-link)
    NAV_ITEMS.forEach((item) => {
      if (item.divider || item.external || item.id === "admin") {
        // Keep dividers/special items — but only add if not already included
        if (!ordered.find((o) => o.id === item.id)) {
          // Don't add dividers; they're structural
        }
      } else if (!ordered.find((o) => o.id === item.id)) {
        // If hidden via visibility, skip
        if (sectionVisibility && sectionVisibility[item.id] === false) return;
        ordered.push(item);
      }
    });
    // Add special items at the end
    const specialItems = NAV_ITEMS.filter((item) => item.external || item.id === "admin");
    specialItems.forEach((item) => {
      if (!ordered.find((o) => o.id === item.id)) {
        ordered.push(item);
      }
    });
    return ordered;
  }, [settings]);

  // Build a set of days that have events for the current calendar month
  const eventDaySet = useMemo(() => {
    const set = new Set();
    events.forEach((evt) => {
      if (!evt.event_date) return;
      const d = new Date(evt.event_date + "T00:00:00");
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [events, calYear, calMonth]);

  // Build calendar days array
  const calDays = useMemo(() => {
    const days = [];
    const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: "", empty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        hasEvent: eventDaySet.has(d),
        isToday: isCurrentMonth && d === today.getDate(),
      });
    }
    return days;
  }, [calYear, calMonth, eventDaySet]);

  // Show loading state while checking auth
  if (!authChecked || !guild) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0a", color: "#888", fontFamily: "var(--font-dm-sans), sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>✨</div>
          <div>Verifying your guild membership...</div>
        </div>
      </div>
    );
  }

  // Build guild-specific CSS variables
  const guildStyle = {
    "--a": guild.colors.primary,
    "--b": guild.colors.secondary,
    "--c": guild.colors.accent,
    "--a-rgb": guild.colors.primaryRgb,
    "--c-rgb": guild.colors.accentRgb,
    "--grad": guild.colors.gradient,
    "--grad-card": guild.colors.cardBg,
    "--dark-page": guild.colors.dark,
    "--dark-card": guild.colors.darkCard,
    "--guild-border": guild.colors.border,
    "--guild-text": guild.colors.text,
    "--guild-text2": guild.colors.text2,
    "--guild-muted": guild.colors.muted,
  };

  function showSection(id) {
    setActiveSection(id);
    setSelectedNewsletter(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showDayEvents(day) {
    const eventsForDay = events.filter((e) => {
      if (!e.event_date) return false;
      const d = new Date(e.event_date + "T00:00:00");
      return d.getFullYear() === calYear && d.getMonth() === calMonth && d.getDate() === day;
    });
    if (eventsForDay.length > 0) {
      setPopupDay({ day, events: eventsForDay });
      setShowEventPopup(true);
    }
  }

  function goCalPrev() {
    if (calMonth === 0) {
      setCalYear(calYear - 1);
      setCalMonth(11);
    } else {
      setCalMonth(calMonth - 1);
    }
  }

  function goCalNext() {
    if (calMonth === 11) {
      setCalYear(calYear + 1);
      setCalMonth(0);
    } else {
      setCalMonth(calMonth + 1);
    }
  }

  // Calculate days to next Guild Hall recap (find the next upcoming recap-like event, or use the first event)
  const nextGuildHallEvent = events.find((e) =>
    e.title && e.title.toLowerCase().includes("guild hall")
  );
  const guildHallDate = nextGuildHallEvent
    ? new Date(nextGuildHallEvent.event_date + "T00:00:00")
    : null;
  const today = new Date();
  const daysToGH = guildHallDate
    ? Math.max(0, Math.ceil((guildHallDate - today) / (1000 * 60 * 60 * 24)))
    : null;

  // The newsletter to display in the read view
  const displayNewsletter = selectedNewsletter || latestNewsletter;

  return (
    <div style={guildStyle}>
      {/* Body gradient overlay */}
      <div className="guild-bg-overlay" style={{
        background: `radial-gradient(ellipse 80% 50% at 20% 10%, rgba(${guild.colors.primaryRgb},0.08), transparent), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(${guild.colors.accentRgb},0.06), transparent)`
      }} />

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-logo">{guild.emoji}</div>
        {orderedNavItems.map((item) => {
          if (item.divider) return <div key={item.id} className="nav-divider" />;
          if (item.external) {
            return (
              <Link key={item.id} href="/guildie-games" className="nav-item">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          }
          if (item.id === "admin") {
            // Only show admin link for users with admin access
            if (!canAccessAdmin(user)) return null;
            return (
              <Link key={item.id} href="/admin" className={`nav-item ${activeSection === item.id ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          }
          return (
            <div
              key={item.id}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => showSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span className="guild-wordmark">{guild.name}</span>
          </div>
          <SearchPanel guild={slug} onNavigate={showSection} />
          <div className="topbar-right">
            <div className="notif-btn">
              {"\ud83d\udd14"}
              <div className="notif-dot" />
            </div>
            <div className="user-chip">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name || user.username}
                  className="user-avatar-img"
                  style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div className="user-avatar">{"\ud83c\udf38"}</div>
              )}
              <span className="user-name">{user?.display_name || user?.username || "Guildie"}</span>
            </div>
            <button
              onClick={() => {
                fetch("/api/auth/logout", { method: "POST" })
                  .then(() => { window.location.href = "/"; })
                  .catch(console.error);
              }}
              style={{
                fontSize: "12px",
                color: "var(--guild-muted)",
                background: "none",
                cursor: "pointer",
                padding: "8px 12px",
                border: "1px solid var(--guild-border)",
                borderRadius: "10px",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Logout
            </button>
            <Link
              href="/"
              style={{
                fontSize: "12px",
                color: "var(--guild-muted)",
                textDecoration: "none",
                padding: "8px 12px",
                border: "1px solid var(--guild-border)",
                borderRadius: "10px",
                whiteSpace: "nowrap",
              }}
            >
              {"\u2190"} All Guilds
            </Link>
          </div>
        </header>

        {/* ===== HOME SECTION ===== */}
        <section className={`page-section ${activeSection === "home" ? "active" : ""}`}>
          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card" onClick={() => showSection("archive")} style={{ cursor: "pointer" }}>
              <div className="stat-value">{newsletters.length}</div>
              <div className="stat-label">Issues Published</div>
              <div className="stat-sub">View archive {"\u2192"}</div>
            </div>
            <div className="stat-card" onClick={() => showSection("events")} style={{ cursor: "pointer" }}>
              <div className="stat-value">{events.length}</div>
              <div className="stat-label">Upcoming Events</div>
              <div className="stat-sub">Next 30 days {"\u2192"}</div>
            </div>
            <div className="stat-card" onClick={() => showSection("events")} style={{ cursor: "pointer" }}>
              <div className="stat-value">{daysToGH !== null ? daysToGH : "\u2014"}</div>
              <div className="stat-label">Days to Guild Hall</div>
              <div className="stat-sub">Next meeting {"\u2192"}</div>
            </div>
            <div className="stat-card">
              <Link href="/guildie-games" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="stat-value">M2</div>
                <div className="stat-label">Guildie Games</div>
                <div className="stat-sub">Month 2 Active {"\u2192"} View {"\u2192"}</div>
              </Link>
            </div>
          </div>

          {/* Hero */}
          <div className="hero">
            <div className="hero-content">
              <div className="hero-badge">
                {latestNewsletter
                  ? `\u2728 Issue #${latestNewsletter.issue_number} \u2014 ${formatDateLong(latestNewsletter.published_at)}`
                  : "\u2728 Welcome"}
              </div>
              <h1 className="hero-title">
                Welcome back,<br />
                <span className="ombre">{user?.display_name || user?.username || "Guildie"}! {guild.emoji}</span>
              </h1>
              <p className="hero-desc">
                Your weekly roundup of everything happening in the {guild.name}. Stay connected, get involved, and celebrate our community.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => showSection("newsletter")}>Read This Week&apos;s Issue {"\u2192"}</button>
                <button className="btn-outline" onClick={() => showSection("events")}>View Events</button>
              </div>
            </div>
          </div>

          {/* This Week's Newsletter */}
          <div className="section-header">
            <h2 className="section-title">{"\ud83d\udcf0"} This Week&apos;s Newsletter</h2>
            <a className="section-link" onClick={() => showSection("archive")}>All Issues {"\u2192"}</a>
          </div>
          {latestNewsletter ? (
            <div className="featured-card">
              <div className="featured-img">{guild.emoji}</div>
              <div className="featured-content">
                <div className="featured-label">
                  <div className="live-dot" />
                  Latest Issue
                </div>
                <h2 className="featured-title">{latestNewsletter.title}</h2>
                <p className="featured-excerpt">{latestNewsletter.excerpt || (latestNewsletter.content ? latestNewsletter.content.substring(0, 180) + "..." : "")}</p>
                <button className="btn-primary" onClick={() => showSection("newsletter")}>Read Full Issue {"\u2192"}</button>
              </div>
            </div>
          ) : (
            <div className="featured-card">
              <div className="featured-img">{guild.emoji}</div>
              <div className="featured-content">
                <p className="featured-excerpt" style={{ color: "var(--guild-muted)" }}>No newsletters published yet. Check back soon!</p>
              </div>
            </div>
          )}

          {/* Announcements Preview */}
          <div className="section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">{"\ud83d\udce3"} Announcements</h2>
            <a className="section-link" onClick={() => showSection("announcements")}>See All {"\u2192"}</a>
          </div>
          {announcements.length > 0 ? (
            announcements.slice(0, 2).map((ann, i) => (
              <div key={ann.id || i} className={`ann-item ${ann.pinned ? "pinned" : ""}`}>
                <div className="ann-icon">{ann.icon || "\ud83d\udce3"}</div>
                <div className="ann-body">
                  <div className="ann-title">
                    <InlineEditor value={ann.title} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/announcements", ann.id, "title", v)} as="span" />
                    {ann.pinned && <span className="pin-badge">PINNED</span>}
                  </div>
                  <InlineEditor value={ann.content} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/announcements", ann.id, "content", v)} as="div" className="ann-text" multiline />
                  <div className="ann-date">{formatDateShort(ann.created_at?.split("T")[0])}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No announcements yet.</p>
          )}

          {/* Featured Events */}
          <div className="section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">{"\ud83d\udcc5"} Featured Events</h2>
            <a className="section-link" onClick={() => showSection("events")}>Full Calendar {"\u2192"}</a>
          </div>
          {events.length > 0 ? (
            <div className="grid-3">
              {events.slice(0, 3).map((evt, i) => {
                const { day, month } = parseEventDate(evt.event_date);
                return (
                  <div key={evt.id || i} className="event-card">
                    <div className="event-date-badge">
                      <span className="event-day">{day}</span>
                      <span className="event-month">{month}</span>
                    </div>
                    <div className="event-name">{evt.title}</div>
                    <div className="event-time">{"\ud83d\udd52"} {evt.event_time}</div>
                    <AddToCalendar event={evt} compact />
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No upcoming events.</p>
          )}

          {/* Guildie Spotlight Preview */}
          <div className="section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">{"\u2728"} Guildie Spotlight</h2>
            <a className="section-link" onClick={() => showSection("spotlight")}>Past Spotlights {"\u2192"}</a>
          </div>
          {spotlight ? (
            <div className="spotlight-card">
              <div className="spotlight-avatar">{"\ud83c\udf38"}</div>
              <div className="spotlight-content">
                <div className="spotlight-week">{"\u2728"} {spotlight.featured_week || "This Week"}</div>
                <InlineEditor value={spotlight.member_name} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/spotlight", spotlight.id, "member_name", v)} as="div" className="spotlight-name" />
                <div className="spotlight-handle">{spotlight.member_handle}</div>
                <InlineEditor value={spotlight.bio} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/spotlight", spotlight.id, "bio", v)} as="div" className="spotlight-blurb" multiline />
                {spotlight.achievement && (
                  <div className="spotlight-achievement">{guild.emoji} {spotlight.achievement}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="spotlight-card">
              <div className="spotlight-avatar">{"\u2728"}</div>
              <div className="spotlight-content">
                <p style={{ color: "var(--guild-muted)" }}>No spotlight this week. Check back soon!</p>
              </div>
            </div>
          )}

          {/* Guildie Games CTA */}
          <div className="section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">{"\ud83c\udfc6"} Guildie Games</h2>
          </div>
          <Link href="/guildie-games" className="games-cta" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="games-trophy-big">{"\ud83c\udfc6"}</div>
            <div className="games-cta-content">
              <div className="games-cta-title">Guildie Games {"\u2014"} Month 2 Active!</div>
              <div className="games-cta-sub">Think Guinness World Records for Unity Guilds. Submit your best clips and compete!</div>
              <div className="games-scoreboard-mini">
                <div className="mini-score-row">
                  <span className="mini-rank">{"\ud83e\udd47"}</span>
                  <span className="mini-guild">{"\ud83d\udc9c"} Women&apos;s Guild</span>
                  <span className="mini-val">47 clips</span>
                </div>
                <div className="mini-score-row">
                  <span className="mini-rank">{"\ud83e\udd48"}</span>
                  <span className="mini-guild">{"\ud83d\udda4"} Black Guild</span>
                  <span className="mini-val">38 clips</span>
                </div>
                <div className="mini-score-row">
                  <span className="mini-rank">{"\ud83e\udd49"}</span>
                  <span className="mini-guild">{"\ud83e\udeb6"} Indigenous Alliance</span>
                  <span className="mini-val">30 clips</span>
                </div>
              </div>
            </div>
            <span style={{ fontSize: "24px", opacity: 0.5 }}>{"\u2192"}</span>
          </Link>
        </section>

        {/* ===== NEWSLETTER SECTION ===== */}
        <section className={`page-section ${activeSection === "newsletter" ? "active" : ""}`}>
          {displayNewsletter ? (
            <div className="nl-read-view">
              <div className="nl-header">
                <div className="nl-issue">ISSUE #{displayNewsletter.issue_number} {"\u00b7"} {formatDateLong(displayNewsletter.published_at)} {"\u00b7"} {guild.name.toUpperCase()}</div>
                <h1 className="nl-main-title">{displayNewsletter.title}</h1>
                <div className="nl-meta">Published by the Newsletter Team {"\u00b7"} {estimateReadTime(displayNewsletter.content)}</div>
              </div>
              <div className="nl-body" dangerouslySetInnerHTML={{ __html: displayNewsletter.content || "" }} />
            </div>
          ) : (
            <div className="nl-read-view">
              <div className="nl-header">
                <h1 className="nl-main-title">No Newsletter Available</h1>
                <div className="nl-meta" style={{ color: "var(--guild-muted)" }}>
                  No newsletters have been published yet. Check back soon!
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ===== ARCHIVE SECTION ===== */}
        <section className={`page-section ${activeSection === "archive" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\ud83d\udcda"} Newsletter Archive</h2>
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Browse all past newsletter issues from the {guild.name}.
          </p>
          {newsletters.length > 0 ? (
            <div className="archive-grid">
              {newsletters.map((issue) => (
                <div
                  key={issue.id || issue.issue_number}
                  className="archive-card"
                  onClick={() => {
                    setSelectedNewsletter(issue);
                    showSection("newsletter");
                  }}
                >
                  <div className="archive-date">ISSUE #{issue.issue_number} {"\u00b7"} {formatDateShort(issue.published_at)}</div>
                  <div className="archive-title">{issue.title}</div>
                  <div className="archive-preview">Click to read the full issue {"\u2192"}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No newsletters in the archive yet.</p>
          )}
        </section>

        {/* ===== ANNOUNCEMENTS SECTION ===== */}
        <section className={`page-section ${activeSection === "announcements" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\ud83d\udce3"} Announcements</h2>
          </div>
          {announcements.length > 0 ? (
            announcements.map((ann, i) => (
              <div key={ann.id || i} className={`ann-item ${ann.pinned ? "pinned" : ""}`}>
                <div className="ann-icon">{ann.icon || "\ud83d\udce3"}</div>
                <div className="ann-body">
                  <div className="ann-title">
                    <InlineEditor value={ann.title} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/announcements", ann.id, "title", v)} as="span" />
                    {ann.pinned && <span className="pin-badge">PINNED</span>}
                  </div>
                  <InlineEditor value={ann.content} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/announcements", ann.id, "content", v)} as="div" className="ann-text" multiline />
                  <div className="ann-date">{formatDateShort(ann.created_at?.split("T")[0])}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No announcements yet.</p>
          )}
        </section>

        {/* ===== EVENTS SECTION ===== */}
        <section className={`page-section ${activeSection === "events" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\ud83d\udcc5"} Upcoming Events</h2>
          </div>

          {/* Calendar Widget */}
          <div className="cal-widget">
            <div className="cal-header">
              <div className="cal-title">{getCalendarMonthName(calYear, calMonth)}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div className="cal-nav-btn" onClick={goCalPrev}>&lt;</div>
                <div className="cal-nav-btn" onClick={goCalNext}>&gt;</div>
              </div>
            </div>
            <div className="cal-grid">
              <div className="cal-days-header">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="cal-day-name">{d}</div>
                ))}
              </div>
              <div className="cal-dates">
                {calDays.map((cell, i) => (
                  <div
                    key={i}
                    className={`cal-date ${cell.empty ? "other-month" : ""} ${cell.isToday ? "today" : ""} ${cell.hasEvent ? "has-event" : ""}`}
                    onClick={() => cell.hasEvent && showDayEvents(cell.day)}
                    style={cell.hasEvent ? { cursor: "pointer" } : {}}
                  >
                    {cell.day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Event Cards */}
          {events.length > 0 ? (
            <div className="grid-2" style={{ marginTop: "24px" }}>
              {events.map((evt, i) => {
                const { day, month } = parseEventDate(evt.event_date);
                return (
                  <div key={evt.id || i} className="event-card">
                    <div className="event-date-badge">
                      <span className="event-day">{day}</span>
                      <span className="event-month">{month}</span>
                    </div>
                    <InlineEditor value={evt.title} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/events", evt.id, "title", v)} as="div" className="event-name" />
                    <div className="event-time">{"\ud83d\udd52"} {evt.event_time} {"\u00b7"} {evt.location}</div>
                    <InlineEditor value={evt.description} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/events", evt.id, "description", v)} as="div" className="event-desc" multiline />
                    <AddToCalendar event={evt} compact />
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0", marginTop: "24px" }}>No upcoming events scheduled.</p>
          )}
        </section>

        {/* ===== SPOTLIGHT SECTION ===== */}
        <section className={`page-section ${activeSection === "spotlight" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\u2728"} Guildie Spotlight</h2>
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Each week we celebrate an outstanding member of the {guild.name}.
          </p>
          {spotlight ? (
            <div className="spotlight-card">
              <div className="spotlight-avatar">{"\ud83c\udf38"}</div>
              <div className="spotlight-content">
                <div className="spotlight-week">{"\u2728"} {spotlight.featured_week || "This Week"} {"\u2014"} Current Spotlight</div>
                <InlineEditor value={spotlight.member_name} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/spotlight", spotlight.id, "member_name", v)} as="div" className="spotlight-name" />
                <div className="spotlight-handle">{spotlight.member_handle}</div>
                <InlineEditor value={spotlight.bio} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/spotlight", spotlight.id, "bio", v)} as="div" className="spotlight-blurb" multiline />
                {spotlight.achievement && (
                  <div className="spotlight-achievement">{guild.emoji} {spotlight.achievement}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="spotlight-card">
              <div className="spotlight-avatar">{"\u2728"}</div>
              <div className="spotlight-content">
                <p style={{ color: "var(--guild-muted)" }}>No current spotlight. Check back next week!</p>
              </div>
            </div>
          )}

          <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "18px", fontWeight: 700, color: "var(--guild-text)", margin: "32px 0 16px" }}>Past Spotlights</h3>
          {pastSpotlights.length > 0 ? (
            <div className="grid-2">
              {pastSpotlights.map((sp, i) => (
                <div key={sp.id || i} className="card">
                  <div className="card-top" />
                  <div className="card-body">
                    <span className="card-tag">{sp.featured_week || formatDateMedium(sp.created_at?.split("T")[0])}</span>
                    <div className="card-title">{sp.member_name}</div>
                    <div className="card-excerpt">{sp.bio}</div>
                    <div className="card-meta">
                      <span className="card-date">{sp.achievement || ""}</span>
                      <button className="read-btn">View {"\u2192"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No past spotlights yet.</p>
          )}
        </section>

        {/* ===== RECAPS SECTION ===== */}
        <section className={`page-section ${activeSection === "recaps" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\ud83c\udfdb\ufe0f"} Guild Hall Recaps</h2>
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Missed a meeting? Catch up on everything discussed at our monthly Guild Hall sessions.
          </p>
          {recaps.length > 0 ? (
            recaps.map((recap, i) => (
              <div key={recap.id || i} className="recap-card">
                <div className="recap-month">{formatMonthYear(recap.meeting_date)}</div>
                <InlineEditor value={recap.title} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/recaps", recap.id, "title", v)} as="div" className="recap-title" />
                <InlineEditor value={recap.summary} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/recaps", recap.id, "summary", v)} as="div" className="recap-summary" multiline />
                <div className="recap-topics">
                  {(recap.topics || []).map((topic, j) => (
                    <span key={j} className="topic-chip">{topic}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No Guild Hall recaps yet.</p>
          )}
        </section>

        {/* ===== HIGHLIGHTS SECTION ===== */}
        <section className={`page-section ${activeSection === "highlights" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\ud83c\udf1f"} Guild Event Highlights</h2>
          </div>
          {highlights.length > 0 ? (
            <div className="grid-3">
              {highlights.map((hl, i) => (
                <div key={hl.id || i} className="highlight-card">
                  <div className="highlight-img">{hl.image_url ? <img src={hl.image_url} alt={hl.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : guild.emoji}</div>
                  <div className="highlight-body">
                    <div className="highlight-event">{hl.event_type}</div>
                    <InlineEditor value={hl.title} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/highlights", hl.id, "title", v)} as="div" className="highlight-title" />
                    <div className="highlight-date">{formatDateShort(hl.event_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No highlights yet.</p>
          )}
        </section>

        {/* ===== STREAMS SECTION ===== */}
        <section className={`page-section ${activeSection === "streams" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\ud83c\udfae"} Live Streams</h2>
          </div>
          <div className="stream-section">
            <div className="stream-header">
              <span>{"\ud83c\udfae"} {guild.name} {"\u2014"} Twitch Team</span>
              <div className="stream-live-badge">
                <div className="live-dot" />
                LIVE
              </div>
            </div>
            <div className="stream-placeholder">
              <div style={{ fontSize: "48px", opacity: 0.4 }}>{"\ud83d\udcfa"}</div>
              <div style={{ fontWeight: 600, color: "var(--b)" }}>
                Twitch Team: twitch.tv/team/{guild.slug === "women" ? "womensguild" : guild.slug + "guild"}
              </div>
              <a
                href={`https://twitch.tv/team/${guild.slug === "women" ? "womensguild" : guild.slug + "guild"}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--b)", textDecoration: "underline", marginTop: "8px" }}
              >
                Open Twitch Team {"\u2192"}
              </a>
            </div>
          </div>
        </section>

        {/* ===== ADMIN SECTION ===== */}
        <section className={`page-section ${activeSection === "admin" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\u2699\ufe0f"} Admin Panel</h2>
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Manage your guild&apos;s content from the full admin dashboard.
          </p>
          <Link href="/admin" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
            Open Admin Dashboard {"\u2192"}
          </Link>
        </section>
      </div>

      {/* Event Popup Overlay */}
      {showEventPopup && popupDay && (
        <div className="event-popup-overlay show" onClick={() => setShowEventPopup(false)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-date-title">{getCalendarMonthName(calYear, calMonth).split(" ")[0]} {popupDay.day}, {calYear}</div>
              <div className="popup-close" onClick={() => setShowEventPopup(false)}>{"\u2715"}</div>
            </div>
            <div className="popup-events">
              {popupDay.events.map((evt, i) => (
                <div key={evt.id || i} className="popup-event">
                  <div className="popup-event-name">{evt.title}</div>
                  <div className="popup-event-time">{evt.event_time} {"\u00b7"} {evt.location}</div>
                  <div className="popup-event-desc">{evt.description}</div>
                  <div className="popup-event-actions">
                    <AddToCalendar event={evt} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
