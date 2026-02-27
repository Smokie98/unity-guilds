"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getGuild, GUILDS } from "@/lib/guilds";
import { useGuildData } from "@/hooks/useGuildData";
import { useSearchParams } from "next/navigation";
import AddToCalendar from "@/components/AddToCalendar";
import SearchPanel from "@/components/SearchPanel";
import InlineEditor from "@/components/InlineEditor";
import ImageUpload from "@/components/ImageUpload";
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

// Helper: safely parse a date string (handles both "YYYY-MM-DD" and full ISO timestamps)
function safeDate(dateStr) {
  if (!dateStr) return null;
  // If it already contains "T", it's a full timestamp — parse directly
  if (dateStr.includes("T")) return new Date(dateStr);
  // Otherwise treat as date-only
  return new Date(dateStr + "T00:00:00");
}

// Helper: format a date string to "FEB 18, 2026" style
function formatDateShort(dateStr) {
  const d = safeDate(dateStr);
  if (!d || isNaN(d)) return "";
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

// Helper: format a date string to "FEBRUARY 18, 2026" style
function formatDateLong(dateStr) {
  const d = safeDate(dateStr);
  if (!d || isNaN(d)) return "";
  const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Helper: format a date string to "FEBRUARY 2026" style
function formatMonthYear(dateStr) {
  const d = safeDate(dateStr);
  if (!d || isNaN(d)) return "";
  const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Helper: format "Feb 11, 2026" style
function formatDateMedium(dateStr) {
  const d = safeDate(dateStr);
  if (!d || isNaN(d)) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Helper: parse event_date to day and month parts
function parseEventDate(dateStr) {
  const d = safeDate(dateStr);
  if (!d || isNaN(d)) return { day: "", month: "" };
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
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [addEventDate, setAddEventDate] = useState(null);
  const [addEventSaving, setAddEventSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);

  // Expandable content states
  const [expandedSpotlight, setExpandedSpotlight] = useState(null);
  const [expandedRecap, setExpandedRecap] = useState(null);
  const [expandedHighlight, setExpandedHighlight] = useState(null);

  // Edit event modal
  const [editingEvent, setEditingEvent] = useState(null);
  const [editEventData, setEditEventData] = useState({});
  const [editEventSaving, setEditEventSaving] = useState(false);

  // Inline add forms
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [showAddSpotlight, setShowAddSpotlight] = useState(false);
  const [showAddRecap, setShowAddRecap] = useState(false);
  const [showAddHighlight, setShowAddHighlight] = useState(false);
  const [inlineFormSaving, setInlineFormSaving] = useState(false);

  // Notification bell
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Twitch stream channels management
  const [newTwitchChannel, setNewTwitchChannel] = useState("");

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

  // Auto-navigate calendar to month of first upcoming event
  const [calAutoJumped, setCalAutoJumped] = useState(false);
  useEffect(() => {
    if (!calAutoJumped && events.length > 0) {
      const firstDate = safeDate(events[0].event_date);
      if (firstDate && !isNaN(firstDate)) {
        setCalYear(firstDate.getFullYear());
        setCalMonth(firstDate.getMonth());
      }
      setCalAutoJumped(true);
    }
  }, [events, calAutoJumped]);

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

  // Read ?section= query param for search results page navigation
  const searchParams = useSearchParams();
  useEffect(() => {
    const sectionParam = searchParams.get("section");
    if (sectionParam) setActiveSection(sectionParam);
  }, [searchParams]);

  // Notification count — new content since last visit
  const newContentCount = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const lastVisited = localStorage.getItem(`last_visited_${slug}`);
    if (!lastVisited) return 0;
    const lastDate = new Date(lastVisited);
    let count = 0;
    announcements.forEach((a) => { if (a.created_at && new Date(a.created_at) > lastDate) count++; });
    events.forEach((e) => { if (e.created_at && new Date(e.created_at) > lastDate) count++; });
    newsletters.forEach((n) => { if (n.published_at && new Date(n.published_at) > lastDate) count++; });
    return count;
  }, [announcements, events, newsletters, slug]);

  // Build notification items for dropdown
  const notifItems = useMemo(() => {
    if (typeof window === "undefined") return [];
    const lastVisited = localStorage.getItem(`last_visited_${slug}`);
    if (!lastVisited) return [];
    const lastDate = new Date(lastVisited);
    const items = [];
    announcements.forEach((a) => { if (a.created_at && new Date(a.created_at) > lastDate) items.push({ type: "announcements", title: a.title, date: a.created_at }); });
    events.forEach((e) => { if (e.created_at && new Date(e.created_at) > lastDate) items.push({ type: "events", title: e.title, date: e.created_at }); });
    newsletters.forEach((n) => { if (n.published_at && new Date(n.published_at) > lastDate) items.push({ type: "newsletter", title: n.title, date: n.published_at }); });
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items.slice(0, 10);
  }, [announcements, events, newsletters, slug]);

  // Update last visited on page unload
  useEffect(() => {
    const updateLastVisited = () => localStorage.setItem(`last_visited_${slug}`, new Date().toISOString());
    window.addEventListener("beforeunload", updateLastVisited);
    return () => { updateLastVisited(); window.removeEventListener("beforeunload", updateLastVisited); };
  }, [slug]);

  // Edit event handlers
  async function handleEditEvent(e) {
    e.preventDefault();
    setEditEventSaving(true);
    try {
      await fetch(`/api/events/${editingEvent}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEventData),
      });
      setEditingEvent(null);
      window.location.reload();
    } catch { /* keep modal open */ } finally { setEditEventSaving(false); }
  }

  // Inline add handlers
  async function handleInlineAdd(endpoint, data, closeFn) {
    setInlineFormSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guild: slug, ...data }),
      });
      if (!res.ok) throw new Error("Failed");
      closeFn();
      window.location.reload();
    } catch { /* keep form open */ } finally { setInlineFormSaving(false); }
  }

  // Tag management
  async function removeTag(recapId, currentTopics, index) {
    const newTopics = currentTopics.filter((_, i) => i !== index);
    await inlineSave("/api/recaps", recapId, "topics", newTopics);
    window.location.reload();
  }

  async function addTag(recapId, currentTopics) {
    const tag = prompt("Enter new topic tag:");
    if (tag && tag.trim()) {
      const newTopics = [...(currentTopics || []), tag.trim()];
      await inlineSave("/api/recaps", recapId, "topics", newTopics);
      window.location.reload();
    }
  }

  // Twitch channel management
  async function addTwitchChannel() {
    if (!newTwitchChannel.trim()) return;
    const current = settings?.twitch_channels || [];
    const updated = [...current, newTwitchChannel.trim().toLowerCase()];
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guild: slug, twitch_channels: updated }),
    });
    setNewTwitchChannel("");
    window.location.reload();
  }

  async function removeTwitchChannel(channel) {
    const current = settings?.twitch_channels || [];
    const updated = current.filter((c) => c !== channel);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guild: slug, twitch_channels: updated }),
    });
    window.location.reload();
  }

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

  // Build a map of day → events for the current calendar month
  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((evt) => {
      if (!evt.event_date) return;
      const d = safeDate(evt.event_date);
      if (!d || isNaN(d)) return;
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(evt);
      }
    });
    return map;
  }, [events, calYear, calMonth]);

  // Build calendar days array with previous/next month trailing days
  const calDays = useMemo(() => {
    const days = [];
    const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;

    // Previous month trailing days
    const prevMonthDays = calMonth === 0 ? getDaysInMonth(calYear - 1, 11) : getDaysInMonth(calYear, calMonth - 1);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, otherMonth: true, events: [] });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        events: eventsByDay[d] || [],
        isToday: isCurrentMonth && d === today.getDate(),
      });
    }
    // Next month trailing days to fill the last row
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        days.push({ day: d, otherMonth: true, events: [] });
      }
    }
    return days;
  }, [calYear, calMonth, eventsByDay]);

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

  function showDayEvents(day, dayEvents) {
    if (dayEvents && dayEvents.length > 0) {
      setPopupDay({ day, events: dayEvents });
      setShowEventPopup(true);
    }
  }

  function openAddEvent(day) {
    const monthStr = String(calMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    setAddEventDate(`${calYear}-${monthStr}-${dayStr}`);
    setShowAddEvent(true);
  }

  async function handleAddEvent(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      guild: slug,
      title: form.title.value.trim(),
      event_date: addEventDate,
      event_time: form.event_time.value.trim() || "7:00 PM EST",
      location: form.location.value.trim() || "Discord",
      description: form.description.value.trim(),
    };
    if (!data.title) return;
    setAddEventSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      setShowAddEvent(false);
      setAddEventDate(null);
      // Reload the page to refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error creating event:", err);
    } finally {
      setAddEventSaving(false);
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
            <div className="notif-btn" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
              {"\ud83d\udd14"}
              {newContentCount > 0 && <div className="notif-dot">{newContentCount}</div>}
              {showNotifDropdown && (
                <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="notif-header">Notifications</div>
                  {notifItems.length > 0 ? notifItems.map((item, idx) => (
                    <div key={idx} className="notif-item" onClick={() => { setShowNotifDropdown(false); showSection(item.type); }}>
                      <div className="notif-item-title">{item.title}</div>
                      <div className="notif-item-meta">{item.type} {"\u00b7"} {formatDateShort(item.date?.split("T")[0])}</div>
                    </div>
                  )) : (
                    <div className="notif-empty">No new content since your last visit</div>
                  )}
                </div>
              )}
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
            {userCanEdit && (
              <button className="btn-add-inline" onClick={() => setShowAddAnnouncement(true)}>+ New Announcement</button>
            )}
          </div>
          {announcements.length > 0 ? (
            announcements.map((ann, i) => (
              <div key={ann.id || i} className={`ann-item ${ann.pinned ? "pinned" : ""}`}>
                <div className="ann-icon">
                  <InlineEditor value={ann.icon || "\ud83d\udce3"} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/announcements", ann.id, "icon", v)} as="span" />
                </div>
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

          {/* Full-Size Calendar Grid */}
          <div className="cal-widget">
            <div className="cal-header">
              <div className="cal-title">{getCalendarMonthName(calYear, calMonth)}</div>
              <div className="cal-nav">
                <div className="cal-nav-btn" onClick={goCalPrev}>&lt;</div>
                <div className="cal-nav-btn" onClick={goCalNext}>&gt;</div>
              </div>
            </div>
            <div className="cal-grid">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                <div key={d} className="cal-day-name">{d}</div>
              ))}
              {calDays.map((cell, i) => {
                const cellEvents = cell.events || [];
                const maxShow = 2;
                const extraCount = cellEvents.length - maxShow;
                return (
                  <div
                    key={i}
                    className={`cal-cell ${cell.otherMonth ? "other-month" : ""} ${cell.isToday ? "today" : ""} ${userCanEdit && !cell.otherMonth ? "admin-cell" : ""}`}
                    onClick={() => {
                      if (cell.otherMonth) return;
                      if (cellEvents.length > 0) {
                        showDayEvents(cell.day, cellEvents);
                      }
                    }}
                  >
                    <div className="cal-cell-day">{cell.day}</div>
                    {!cell.otherMonth && (
                      <div className="cal-cell-events">
                        {cellEvents.slice(0, maxShow).map((evt, j) => (
                          <div
                            key={evt.id || j}
                            className="cal-cell-evt"
                            onClick={(e) => {
                              e.stopPropagation();
                              showDayEvents(cell.day, cellEvents);
                            }}
                            title={`${evt.title} — ${evt.event_time || ""}`}
                          >
                            {evt.title}
                          </div>
                        ))}
                        {extraCount > 0 && (
                          <div
                            className="cal-cell-more"
                            onClick={(e) => {
                              e.stopPropagation();
                              showDayEvents(cell.day, cellEvents);
                            }}
                          >
                            +{extraCount} more
                          </div>
                        )}
                      </div>
                    )}
                    {userCanEdit && !cell.otherMonth && (
                      <div
                        className="cal-cell-add"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddEvent(cell.day);
                        }}
                        title="Add event"
                      >
                        +
                      </div>
                    )}
                  </div>
                );
              })}
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
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                      <AddToCalendar event={evt} compact />
                      {userCanEdit && (
                        <button
                          className="btn-add-inline"
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                          onClick={() => {
                            setEditingEvent(evt.id);
                            setEditEventData({
                              title: evt.title || "",
                              event_date: evt.event_date || "",
                              event_time: evt.event_time || "",
                              location: evt.location || "",
                              description: evt.description || "",
                            });
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
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
            {userCanEdit && (
              <button className="btn-add-inline" onClick={() => setShowAddSpotlight(true)}>+ Set Spotlight</button>
            )}
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Each week we celebrate an outstanding member of the {guild.name}.
          </p>
          {spotlight ? (
            <div className="spotlight-card">
              <div className="spotlight-avatar">
                {spotlight.member_avatar ? (
                  <img src={spotlight.member_avatar} alt={spotlight.member_name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : "\ud83c\udf38"}
                {userCanEdit && (
                  <div style={{ marginTop: "8px" }}>
                    <ImageUpload
                      currentUrl={spotlight.member_avatar}
                      onUpload={async (url) => { await inlineSave("/api/spotlight", spotlight.id, "member_avatar", url); window.location.reload(); }}
                      label="Upload Avatar"
                      small
                    />
                  </div>
                )}
              </div>
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
              {pastSpotlights.map((sp, i) => {
                const isExpanded = expandedSpotlight === sp.id;
                return (
                  <div
                    key={sp.id || i}
                    className={`card ${isExpanded ? "card-expanded" : ""}`}
                    onClick={() => setExpandedSpotlight(isExpanded ? null : sp.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-top" />
                    <div className="card-body">
                      <span className="card-tag">{sp.featured_week || formatDateMedium(sp.created_at?.split("T")[0])}</span>
                      <div className="card-title">{sp.member_name}</div>
                      {isExpanded ? (
                        <>
                          <div className="card-excerpt">{sp.bio}</div>
                          {sp.member_handle && <div style={{ fontSize: "13px", color: "var(--guild-muted)", marginTop: "8px" }}>@{sp.member_handle}</div>}
                          {sp.achievement && <div className="spotlight-achievement" style={{ marginTop: "8px" }}>{guild.emoji} {sp.achievement}</div>}
                          {sp.twitch_url && (
                            <a href={sp.twitch_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--a)", marginTop: "8px", display: "inline-block" }} onClick={(e) => e.stopPropagation()}>
                              View on Twitch {"\u2192"}
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="card-excerpt">{sp.bio ? (sp.bio.length > 100 ? sp.bio.substring(0, 100) + "..." : sp.bio) : ""}</div>
                      )}
                      <div className="card-meta">
                        <span className="card-date">{sp.achievement || ""}</span>
                        <button className="read-btn">{isExpanded ? "Collapse" : "View"} {"\u2192"}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No past spotlights yet.</p>
          )}
        </section>

        {/* ===== RECAPS SECTION ===== */}
        <section className={`page-section ${activeSection === "recaps" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\ud83c\udfdb\ufe0f"} Guild Hall Recaps</h2>
            {userCanEdit && (
              <button className="btn-add-inline" onClick={() => setShowAddRecap(true)}>+ Add Recap</button>
            )}
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Missed a meeting? Catch up on everything discussed at our monthly Guild Hall sessions.
          </p>
          {recaps.length > 0 ? (
            recaps.map((recap, i) => {
              const isExpanded = expandedRecap === recap.id;
              return (
                <div
                  key={recap.id || i}
                  className={`recap-card ${isExpanded ? "recap-expanded" : ""}`}
                  onClick={() => setExpandedRecap(isExpanded ? null : recap.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="recap-month">{formatMonthYear(recap.meeting_date)}</div>
                  <InlineEditor value={recap.title} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/recaps", recap.id, "title", v)} as="div" className="recap-title" />
                  {isExpanded ? (
                    <InlineEditor value={recap.summary} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/recaps", recap.id, "summary", v)} as="div" className="recap-summary" multiline />
                  ) : (
                    <div className="recap-summary recap-summary-preview">
                      {recap.summary ? (recap.summary.length > 120 ? recap.summary.substring(0, 120) + "..." : recap.summary) : ""}
                      {recap.summary && recap.summary.length > 120 && <span className="recap-expand-hint">Click to read more</span>}
                    </div>
                  )}
                  <div className="recap-topics" onClick={(e) => e.stopPropagation()}>
                    {(recap.topics || []).map((topic, j) => (
                      <span key={j} className="topic-chip">
                        {topic}
                        {userCanEdit && (
                          <span className="chip-remove" onClick={() => removeTag(recap.id, recap.topics, j)}>{"\u00d7"}</span>
                        )}
                      </span>
                    ))}
                    {userCanEdit && (
                      <span className="topic-chip add-chip" onClick={() => addTag(recap.id, recap.topics)}>+ Add Tag</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: "var(--guild-muted)", padding: "16px 0" }}>No Guild Hall recaps yet.</p>
          )}
        </section>

        {/* ===== HIGHLIGHTS SECTION ===== */}
        <section className={`page-section ${activeSection === "highlights" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">{"\ud83c\udf1f"} Guild Event Highlights</h2>
            {userCanEdit && (
              <button className="btn-add-inline" onClick={() => setShowAddHighlight(true)}>+ Add Highlight</button>
            )}
          </div>
          {highlights.length > 0 ? (
            <div className="grid-3">
              {highlights.map((hl, i) => {
                const isExpanded = expandedHighlight === hl.id;
                return (
                  <div
                    key={hl.id || i}
                    className={`highlight-card ${isExpanded ? "highlight-expanded" : ""}`}
                    onClick={() => setExpandedHighlight(isExpanded ? null : hl.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="highlight-img">
                      {hl.image_url ? <img src={hl.image_url} alt={hl.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : guild.emoji}
                      {userCanEdit && isExpanded && (
                        <div style={{ position: "absolute", bottom: "8px", left: "8px" }} onClick={(e) => e.stopPropagation()}>
                          <ImageUpload
                            currentUrl={hl.image_url}
                            onUpload={async (url) => { await inlineSave("/api/highlights", hl.id, "image_url", url); window.location.reload(); }}
                            label="Upload Image"
                            small
                          />
                        </div>
                      )}
                    </div>
                    <div className="highlight-body">
                      <div className="highlight-event">{hl.event_type}</div>
                      <InlineEditor value={hl.title} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/highlights", hl.id, "title", v)} as="div" className="highlight-title" />
                      <div className="highlight-date">{formatDateShort(hl.event_date)}</div>
                      {isExpanded && (
                        <div className="highlight-expanded-content">
                          {hl.description ? (
                            <InlineEditor value={hl.description} canEdit={userCanEdit} onSave={(v) => inlineSave("/api/highlights", hl.id, "description", v)} as="div" className="highlight-desc" multiline />
                          ) : (
                            <p style={{ color: "var(--guild-muted)", fontSize: "13px" }}>No description available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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

            {/* Twitch Stream Embeds */}
            {(settings?.twitch_channels || []).length > 0 ? (
              <div className="streams-grid">
                {settings.twitch_channels.map((channel) => (
                  <div key={channel} className="stream-embed">
                    <iframe
                      src={`https://player.twitch.tv/?channel=${channel}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`}
                      height="300"
                      width="100%"
                      allowFullScreen
                      style={{ border: "none", borderRadius: "8px" }}
                    />
                    <div style={{ fontSize: "12px", color: "var(--guild-muted)", marginTop: "6px", textAlign: "center" }}>
                      {channel}
                      {userCanEdit && (
                        <span className="chip-remove" style={{ marginLeft: "8px", cursor: "pointer" }} onClick={() => removeTwitchChannel(channel)}>{"\u00d7"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}

            {/* Admin: Add/manage channels */}
            {userCanEdit && (
              <div style={{ marginTop: "16px", padding: "14px", border: "1px solid var(--guild-border)", borderRadius: "12px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--guild-text)", marginBottom: "8px" }}>Manage Twitch Channels</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newTwitchChannel}
                    onChange={(e) => setNewTwitchChannel(e.target.value)}
                    placeholder="Channel name (e.g. ninja)"
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: "8px",
                      background: "rgba(255,255,255,0.05)", border: "1px solid var(--guild-border)",
                      color: "var(--guild-text)", fontSize: "13px", fontFamily: "inherit"
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") addTwitchChannel(); }}
                  />
                  <button className="btn-add-inline" onClick={addTwitchChannel}>Add Channel</button>
                </div>
              </div>
            )}
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

      {/* Event Popup Overlay — view events for a day */}
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
            {userCanEdit && (
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--guild-border)" }}>
                <button
                  className="btn-primary"
                  style={{ width: "100%", padding: "10px", fontSize: "14px" }}
                  onClick={() => {
                    setShowEventPopup(false);
                    openAddEvent(popupDay.day);
                  }}
                >
                  + Add Event on This Day
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal — admin only */}
      {showAddEvent && addEventDate && (
        <div className="event-popup-overlay show" onClick={() => { setShowAddEvent(false); setAddEventDate(null); }}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-date-title">Add Event — {addEventDate}</div>
              <div className="popup-close" onClick={() => { setShowAddEvent(false); setAddEventDate(null); }}>{"\u2715"}</div>
            </div>
            <form className="add-event-form" onSubmit={handleAddEvent}>
              <label>
                Event Title
                <input name="title" type="text" placeholder="e.g. Guild Hall Meeting" required />
              </label>
              <div className="form-row">
                <label>
                  Time
                  <input name="event_time" type="text" placeholder="7:00 PM EST" />
                </label>
                <label>
                  Location
                  <input name="location" type="text" placeholder="Discord" />
                </label>
              </div>
              <label>
                Description
                <textarea name="description" placeholder="What is this event about?" rows={3} />
              </label>
              <div className="add-event-btns">
                <button type="button" className="btn-cancel" onClick={() => { setShowAddEvent(false); setAddEventDate(null); }}>Cancel</button>
                <button type="submit" className="btn-save" disabled={addEventSaving}>
                  {addEventSaving ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal — admin only */}
      {editingEvent && (
        <div className="event-popup-overlay show" onClick={() => setEditingEvent(null)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-date-title">Edit Event</div>
              <div className="popup-close" onClick={() => setEditingEvent(null)}>{"\u2715"}</div>
            </div>
            <form className="add-event-form" onSubmit={handleEditEvent}>
              <label>
                Event Title
                <input type="text" value={editEventData.title || ""} onChange={(e) => setEditEventData({ ...editEventData, title: e.target.value })} required />
              </label>
              <div className="form-row">
                <label>
                  Date
                  <input type="date" value={editEventData.event_date || ""} onChange={(e) => setEditEventData({ ...editEventData, event_date: e.target.value })} />
                </label>
                <label>
                  Time
                  <input type="text" value={editEventData.event_time || ""} onChange={(e) => setEditEventData({ ...editEventData, event_time: e.target.value })} />
                </label>
              </div>
              <label>
                Location
                <input type="text" value={editEventData.location || ""} onChange={(e) => setEditEventData({ ...editEventData, location: e.target.value })} />
              </label>
              <label>
                Description
                <textarea value={editEventData.description || ""} onChange={(e) => setEditEventData({ ...editEventData, description: e.target.value })} rows={3} />
              </label>
              <div className="add-event-btns">
                <button type="button" className="btn-cancel" onClick={() => setEditingEvent(null)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={editEventSaving}>
                  {editEventSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddAnnouncement && (
        <div className="event-popup-overlay show" onClick={() => setShowAddAnnouncement(false)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-date-title">New Announcement</div>
              <div className="popup-close" onClick={() => setShowAddAnnouncement(false)}>{"\u2715"}</div>
            </div>
            <form className="add-event-form" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              handleInlineAdd("/api/announcements", {
                title: form.title.value.trim(),
                content: form.content.value.trim(),
                icon: form.icon.value.trim() || "\ud83d\udce3",
                pinned: form.pinned.checked,
              }, () => setShowAddAnnouncement(false));
            }}>
              <div className="form-row">
                <label style={{ flex: "0 0 80px" }}>
                  Icon
                  <input name="icon" type="text" defaultValue={"\ud83d\udce3"} style={{ textAlign: "center" }} />
                </label>
                <label style={{ flex: 1 }}>
                  Title
                  <input name="title" type="text" placeholder="Announcement title" required />
                </label>
              </div>
              <label>
                Content
                <textarea name="content" placeholder="Announcement content..." rows={4} required />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", flexDirection: "row" }}>
                <input name="pinned" type="checkbox" />
                <span style={{ fontSize: "13px", color: "var(--guild-text)" }}>Pin this announcement</span>
              </label>
              <div className="add-event-btns">
                <button type="button" className="btn-cancel" onClick={() => setShowAddAnnouncement(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={inlineFormSaving}>
                  {inlineFormSaving ? "Creating..." : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Spotlight Modal */}
      {showAddSpotlight && (
        <div className="event-popup-overlay show" onClick={() => setShowAddSpotlight(false)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-date-title">Set New Spotlight</div>
              <div className="popup-close" onClick={() => setShowAddSpotlight(false)}>{"\u2715"}</div>
            </div>
            <form className="add-event-form" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              handleInlineAdd("/api/spotlight", {
                member_name: form.member_name.value.trim(),
                member_handle: form.member_handle.value.trim(),
                bio: form.bio.value.trim(),
                achievement: form.achievement.value.trim(),
                featured_week: form.featured_week.value.trim(),
                twitch_url: form.twitch_url.value.trim(),
              }, () => setShowAddSpotlight(false));
            }}>
              <div className="form-row">
                <label>
                  Member Name
                  <input name="member_name" type="text" placeholder="e.g. GuildMaster2026" required />
                </label>
                <label>
                  Handle
                  <input name="member_handle" type="text" placeholder="@username" />
                </label>
              </div>
              <label>
                Bio
                <textarea name="bio" placeholder="Tell us about this guildie..." rows={3} required />
              </label>
              <div className="form-row">
                <label>
                  Achievement
                  <input name="achievement" type="text" placeholder="e.g. Top Contributor" />
                </label>
                <label>
                  Featured Week
                  <input name="featured_week" type="text" placeholder="e.g. Week of Feb 24" />
                </label>
              </div>
              <label>
                Twitch URL
                <input name="twitch_url" type="text" placeholder="https://twitch.tv/username" />
              </label>
              <div className="add-event-btns">
                <button type="button" className="btn-cancel" onClick={() => setShowAddSpotlight(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={inlineFormSaving}>
                  {inlineFormSaving ? "Creating..." : "Set Spotlight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Recap Modal */}
      {showAddRecap && (
        <div className="event-popup-overlay show" onClick={() => setShowAddRecap(false)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-date-title">Add Guild Hall Recap</div>
              <div className="popup-close" onClick={() => setShowAddRecap(false)}>{"\u2715"}</div>
            </div>
            <form className="add-event-form" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const topicsRaw = form.topics.value.trim();
              handleInlineAdd("/api/recaps", {
                title: form.title.value.trim(),
                meeting_date: form.meeting_date.value,
                summary: form.summary.value.trim(),
                topics: topicsRaw ? topicsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
              }, () => setShowAddRecap(false));
            }}>
              <div className="form-row">
                <label>
                  Title
                  <input name="title" type="text" placeholder="e.g. February Guild Hall" required />
                </label>
                <label>
                  Meeting Date
                  <input name="meeting_date" type="date" required />
                </label>
              </div>
              <label>
                Summary
                <textarea name="summary" placeholder="What was discussed at the meeting?" rows={4} required />
              </label>
              <label>
                Topics (comma-separated)
                <input name="topics" type="text" placeholder="e.g. Events, Moderation, New Members" />
              </label>
              <div className="add-event-btns">
                <button type="button" className="btn-cancel" onClick={() => setShowAddRecap(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={inlineFormSaving}>
                  {inlineFormSaving ? "Creating..." : "Add Recap"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Highlight Modal */}
      {showAddHighlight && (
        <div className="event-popup-overlay show" onClick={() => setShowAddHighlight(false)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-date-title">Add Guild Highlight</div>
              <div className="popup-close" onClick={() => setShowAddHighlight(false)}>{"\u2715"}</div>
            </div>
            <form className="add-event-form" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              handleInlineAdd("/api/highlights", {
                title: form.title.value.trim(),
                event_type: form.event_type.value.trim(),
                event_date: form.event_date.value,
                description: form.description.value.trim(),
              }, () => setShowAddHighlight(false));
            }}>
              <div className="form-row">
                <label>
                  Title
                  <input name="title" type="text" placeholder="e.g. Community Game Night" required />
                </label>
                <label>
                  Event Type
                  <input name="event_type" type="text" placeholder="e.g. Game Night, Workshop" />
                </label>
              </div>
              <label>
                Event Date
                <input name="event_date" type="date" />
              </label>
              <label>
                Description
                <textarea name="description" placeholder="Describe this highlight..." rows={3} />
              </label>
              <div className="add-event-btns">
                <button type="button" className="btn-cancel" onClick={() => setShowAddHighlight(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={inlineFormSaving}>
                  {inlineFormSaving ? "Creating..." : "Add Highlight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
