"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getGuild, GUILDS } from "@/lib/guilds";

// Sample data — will be replaced with Supabase queries in Step 9
const SAMPLE_NEWSLETTER = {
  issueNum: 52,
  date: "FEBRUARY 18, 2026",
  title: "Guild Hall February Recap, Charity Stream Week & Spring Event Lineup!",
  excerpt: "This week we're looking back at an amazing Guild Hall session, celebrating our charity stream success, and previewing what's coming this spring...",
  readTime: "6 min read",
};

const SAMPLE_ARCHIVE = [
  { num: 52, date: "FEB 18, 2026", title: "Guild Hall Recap, Charity Stream & Spring Lineup" },
  { num: 51, date: "FEB 11, 2026", title: "Valentine's Event Wrap-Up & Raid Train Success" },
  { num: 50, date: "FEB 04, 2026", title: "Issue 50 Special: A Year of Our Guild" },
  { num: 49, date: "JAN 28, 2026", title: "January Game Night Recap & February Preview" },
  { num: 48, date: "JAN 21, 2026", title: "New Guildies Welcome Spotlight & Community Goals" },
  { num: 47, date: "JAN 14, 2026", title: "Guild Hall January Recap & 2026 Roadmap Reveal" },
];

const SAMPLE_ANNOUNCEMENTS = [
  { icon: "\ud83d\udccc", title: "Guild Hall Meeting \u2014 March 2026", text: "Our monthly Guild Hall meeting is scheduled for March 15th at 7 PM EST. We'll be discussing spring events, mentorship pairings, and community goals.", date: "FEB 18, 2026", pinned: true },
  { icon: "\ud83d\udccc", title: "Mentorship Program Opens March 1st", text: "Applications for the spring mentorship program open March 1st! Both mentors and mentees welcome.", date: "FEB 18, 2026", pinned: true },
  { icon: "\ud83c\udfc6", title: "Guildie Games Month 2 Is Live!", text: "Submit your best clips in #guildie-games-clips! This month's challenge: Most Clips Submitted.", date: "FEB 16, 2026", pinned: false },
  { icon: "\ud83c\udf89", title: "Charity Stream \u2014 $2,400 Raised!", text: "Together we raised $2,400 during Valentine's Week for charity. Thank you to everyone who participated!", date: "FEB 16, 2026", pinned: false },
];

const SAMPLE_EVENTS = [
  { day: "22", month: "FEB", name: "Game Night: Jackbox Party Pack", time: "7:00 PM EST", location: "Discord Voice", desc: "Jackbox games and laughs with your fellow guildies!" },
  { day: "28", month: "FEB", name: "Streamer Workshop: Branding 101", time: "5:00 PM EST", location: "Discord Stage", desc: "Learn branding basics for your Twitch channel." },
  { day: "01", month: "MAR", name: "Networking Coffee Hour", time: "10:00 AM EST", location: "Discord Voice", desc: "Casual networking and mentorship chat over coffee." },
  { day: "15", month: "MAR", name: "Guild Hall Meeting \u2014 March", time: "7:00 PM EST", location: "Discord Stage", desc: "Monthly meeting to plan spring events and set goals." },
];

const SAMPLE_SPOTLIGHT = {
  week: "Week of February 18, 2026",
  name: "StreamerRose",
  handle: "@streamingrose on Twitch",
  blurb: "Rose has been an incredible force in our community since day one. From organizing raid trains to hosting charity streams, she embodies everything our guild stands for. This month alone, she helped coordinate our Valentine's Charity Marathon that raised over $2,400!",
  achievement: "Charity Stream Coordinator \u2014 $2,400 Raised",
};

const SAMPLE_PAST_SPOTLIGHTS = [
  { date: "Feb 11, 2026", name: "GamingWithLuna", excerpt: "Organized an epic raid train bringing together 8 streamers for 6 hours of community fun.", category: "Community Builder" },
  { date: "Feb 04, 2026", name: "PixelQueenSara", excerpt: "Hosted a free art tutorial stream, teaching overlays & emotes to 40+ attendees.", category: "Creative Achievement" },
];

const SAMPLE_RECAPS = [
  { month: "FEBRUARY 2026", title: "February Guild Hall \u2014 Mentorship, Mental Health & Growth", summary: "120+ Guildies came together for our February session focused on the new mentorship program, mental health resources for streamers, and celebrating Q1 growth.", topics: ["Mentorship Program", "Mental Health", "120 Attendees"] },
  { month: "JANUARY 2026", title: "January Guild Hall \u2014 2026 Goals & New Year Vision", summary: "Goal-setting session where we mapped out our 2026 roadmap including new partnerships and community events.", topics: ["2026 Goals", "Partnerships"] },
];

const SAMPLE_HIGHLIGHTS = [
  { emoji: "\ud83d\udc9c", event: "Charity Stream", title: "Valentine's Charity Marathon \u2014 $2,400!", date: "FEB 10-14, 2026" },
  { emoji: "\ud83c\udfae", event: "Game Night", title: "January Game Night \u2014 80 Players!", date: "JAN 25, 2026" },
  { emoji: "\ud83c\udfdb\ufe0f", event: "Guild Hall", title: "February Guild Hall \u2014 120 Guildies!", date: "FEB 10, 2026" },
];

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

export default function GuildPage() {
  const params = useParams();
  const router = useRouter();
  const guild = getGuild(params.guild);
  const [activeSection, setActiveSection] = useState("home");
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [popupDay, setPopupDay] = useState(null);

  // If guild not found, redirect to home
  useEffect(() => {
    if (!guild) {
      router.push("/");
    }
  }, [guild, router]);

  if (!guild) return null;

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showDayEvents(day) {
    const eventsForDay = SAMPLE_EVENTS.filter(
      (e) => e.day === String(day) || parseInt(e.day) === day
    );
    if (eventsForDay.length > 0) {
      setPopupDay({ day, events: eventsForDay });
      setShowEventPopup(true);
    }
  }

  // Calculate days to guild hall
  const guildHallDate = new Date("2026-03-15");
  const today = new Date();
  const daysToGH = Math.max(0, Math.ceil((guildHallDate - today) / (1000 * 60 * 60 * 24)));

  // Build February 2026 calendar
  const calDays = [];
  const feb2026Start = new Date(2026, 1, 1).getDay(); // Day of week for Feb 1
  for (let i = 0; i < feb2026Start; i++) {
    calDays.push({ day: "", empty: true });
  }
  for (let d = 1; d <= 28; d++) {
    const hasEvent = [22, 28].includes(d);
    const isToday = d === 18;
    calDays.push({ day: d, hasEvent, isToday });
  }

  return (
    <div style={guildStyle}>
      {/* Body gradient overlay */}
      <div className="guild-bg-overlay" style={{
        background: `radial-gradient(ellipse 80% 50% at 20% 10%, rgba(${guild.colors.primaryRgb},0.08), transparent), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(${guild.colors.accentRgb},0.06), transparent)`
      }} />

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-logo">{guild.emoji}</div>
        {NAV_ITEMS.map((item) => {
          if (item.divider) return <div key={item.id} className="nav-divider" />;
          if (item.external) {
            return (
              <Link key={item.id} href="/guildie-games" className="nav-item">
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
          <div className="search-bar">
            <span style={{ color: "var(--guild-muted)" }}>\ud83d\udd0d</span>
            <input type="text" placeholder="Search newsletters, events, spotlights..." />
          </div>
          <div className="topbar-right">
            <div className="notif-btn">
              \ud83d\udd14
              <div className="notif-dot" />
            </div>
            <div className="user-chip">
              <div className="user-avatar">\ud83c\udf38</div>
              <span className="user-name">Guildie</span>
            </div>
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
              \u2190 All Guilds
            </Link>
          </div>
        </header>

        {/* ===== HOME SECTION ===== */}
        <section className={`page-section ${activeSection === "home" ? "active" : ""}`}>
          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card" onClick={() => showSection("archive")} style={{ cursor: "pointer" }}>
              <div className="stat-value">52</div>
              <div className="stat-label">Issues Published</div>
              <div className="stat-sub">View archive \u2192</div>
            </div>
            <div className="stat-card" onClick={() => showSection("events")} style={{ cursor: "pointer" }}>
              <div className="stat-value">4</div>
              <div className="stat-label">Upcoming Events</div>
              <div className="stat-sub">Next 30 days \u2192</div>
            </div>
            <div className="stat-card" onClick={() => showSection("events")} style={{ cursor: "pointer" }}>
              <div className="stat-value">{daysToGH}</div>
              <div className="stat-label">Days to Guild Hall</div>
              <div className="stat-sub">Next meeting \u2192</div>
            </div>
            <div className="stat-card">
              <Link href="/guildie-games" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="stat-value">M2</div>
                <div className="stat-label">Guildie Games</div>
                <div className="stat-sub">Month 2 Active \u2192 View \u2192</div>
              </Link>
            </div>
          </div>

          {/* Hero */}
          <div className="hero">
            <div className="hero-content">
              <div className="hero-badge">\u2728 Issue #{SAMPLE_NEWSLETTER.issueNum} \u2014 {SAMPLE_NEWSLETTER.date}</div>
              <h1 className="hero-title">
                Welcome back,<br />
                <span className="ombre">Guildie! {guild.emoji}</span>
              </h1>
              <p className="hero-desc">
                Your weekly roundup of everything happening in the {guild.name}. Stay connected, get involved, and celebrate our community.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => showSection("newsletter")}>Read This Week&apos;s Issue \u2192</button>
                <button className="btn-outline" onClick={() => showSection("events")}>View Events</button>
              </div>
            </div>
          </div>

          {/* This Week's Newsletter */}
          <div className="section-header">
            <h2 className="section-title">\ud83d\udcf0 This Week&apos;s Newsletter</h2>
            <a className="section-link" onClick={() => showSection("archive")}>All Issues \u2192</a>
          </div>
          <div className="featured-card">
            <div className="featured-img">{guild.emoji}</div>
            <div className="featured-content">
              <div className="featured-label">
                <div className="live-dot" />
                Latest Issue
              </div>
              <h2 className="featured-title">{SAMPLE_NEWSLETTER.title}</h2>
              <p className="featured-excerpt">{SAMPLE_NEWSLETTER.excerpt}</p>
              <button className="btn-primary" onClick={() => showSection("newsletter")}>Read Full Issue \u2192</button>
            </div>
          </div>

          {/* Announcements Preview */}
          <div className="section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">\ud83d\udce3 Announcements</h2>
            <a className="section-link" onClick={() => showSection("announcements")}>See All \u2192</a>
          </div>
          {SAMPLE_ANNOUNCEMENTS.slice(0, 2).map((ann, i) => (
            <div key={i} className={`ann-item ${ann.pinned ? "pinned" : ""}`}>
              <div className="ann-icon">{ann.icon}</div>
              <div className="ann-body">
                <div className="ann-title">
                  {ann.title}
                  {ann.pinned && <span className="pin-badge">PINNED</span>}
                </div>
                <div className="ann-text">{ann.text}</div>
                <div className="ann-date">{ann.date}</div>
              </div>
            </div>
          ))}

          {/* Featured Events */}
          <div className="section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">\ud83d\udcc5 Featured Events</h2>
            <a className="section-link" onClick={() => showSection("events")}>Full Calendar \u2192</a>
          </div>
          <div className="grid-3">
            {SAMPLE_EVENTS.slice(0, 3).map((evt, i) => (
              <div key={i} className="event-card">
                <div className="event-date-badge">
                  <span className="event-day">{evt.day}</span>
                  <span className="event-month">{evt.month}</span>
                </div>
                <div className="event-name">{evt.name}</div>
                <div className="event-time">\ud83d\udd52 {evt.time}</div>
              </div>
            ))}
          </div>

          {/* Guildie Spotlight Preview */}
          <div className="section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">\u2728 Guildie Spotlight</h2>
            <a className="section-link" onClick={() => showSection("spotlight")}>Past Spotlights \u2192</a>
          </div>
          <div className="spotlight-card">
            <div className="spotlight-avatar">\ud83c\udf38</div>
            <div className="spotlight-content">
              <div className="spotlight-week">\u2728 {SAMPLE_SPOTLIGHT.week}</div>
              <div className="spotlight-name">{SAMPLE_SPOTLIGHT.name}</div>
              <div className="spotlight-handle">{SAMPLE_SPOTLIGHT.handle}</div>
              <div className="spotlight-blurb">{SAMPLE_SPOTLIGHT.blurb}</div>
              <div className="spotlight-achievement">{guild.emoji} {SAMPLE_SPOTLIGHT.achievement}</div>
            </div>
          </div>

          {/* Guildie Games CTA */}
          <div className="section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">\ud83c\udfc6 Guildie Games</h2>
          </div>
          <Link href="/guildie-games" className="games-cta" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="games-trophy-big">\ud83c\udfc6</div>
            <div className="games-cta-content">
              <div className="games-cta-title">Guildie Games \u2014 Month 2 Active!</div>
              <div className="games-cta-sub">Think Guinness World Records for Unity Guilds. Submit your best clips and compete!</div>
              <div className="games-scoreboard-mini">
                <div className="mini-score-row">
                  <span className="mini-rank">\ud83e\udd47</span>
                  <span className="mini-guild">\ud83d\udc9c Women&apos;s Guild</span>
                  <span className="mini-val">47 clips</span>
                </div>
                <div className="mini-score-row">
                  <span className="mini-rank">\ud83e\udd48</span>
                  <span className="mini-guild">\ud83d\udda4 Black Guild</span>
                  <span className="mini-val">38 clips</span>
                </div>
                <div className="mini-score-row">
                  <span className="mini-rank">\ud83e\udd49</span>
                  <span className="mini-guild">\ud83e\udeb6 Indigenous Alliance</span>
                  <span className="mini-val">30 clips</span>
                </div>
              </div>
            </div>
            <span style={{ fontSize: "24px", opacity: 0.5 }}>\u2192</span>
          </Link>
        </section>

        {/* ===== NEWSLETTER SECTION ===== */}
        <section className={`page-section ${activeSection === "newsletter" ? "active" : ""}`}>
          <div className="nl-read-view">
            <div className="nl-header">
              <div className="nl-issue">ISSUE #{SAMPLE_NEWSLETTER.issueNum} \u00b7 {SAMPLE_NEWSLETTER.date} \u00b7 {guild.name.toUpperCase()}</div>
              <h1 className="nl-main-title">{SAMPLE_NEWSLETTER.title}</h1>
              <div className="nl-meta">Published by the Newsletter Team \u00b7 {SAMPLE_NEWSLETTER.readTime}</div>
            </div>
            <div className="nl-body">
              <h2>{guild.emoji} A Message from Your Guild Leaders</h2>
              <p>Happy February, Guildies! What a month it has been. From our incredible Guild Hall session to the record-breaking charity streams, this community continues to amaze us every single week.</p>
              <p>This week&apos;s newsletter is packed with recaps, upcoming events, and a very special Guildie Spotlight. Let&apos;s dive in!</p>

              <h2>\ud83c\udfdb\ufe0f Guild Hall February Recap</h2>
              <p>Our February Guild Hall was one for the books! Over 120 Guildies showed up to discuss the new mentorship program, mental health resources for streamers, and our community growth goals for Q1.</p>
              <div className="highlight-box">
                <strong>Key Takeaway:</strong> The mentorship program officially launches March 1st. Applications will open for both mentors and mentees. Stay tuned for the form link in #announcements!
              </div>

              <h2>\ud83c\udf97\ufe0f Charity Stream Results</h2>
              <p>Valentine&apos;s Charity Week was a massive success! Together, our guild raised $2,400 across 12 charity streams. Special shoutout to StreamerRose for coordinating the entire event.</p>

              <h2>\ud83c\udfc6 Guildie Games Update</h2>
              <p>Month 2 of Guildie Games is in full swing! The challenge this month is Most Clips Submitted. Submit your best moments in #guildie-games-clips on Discord.</p>

              <h2>\ud83d\udcc5 Spring Events</h2>
              <p>Mark your calendars for these upcoming events:</p>
              <p>\u2022 <strong>Feb 22</strong> \u2014 Game Night: Jackbox Party Pack (7 PM EST)<br />
              \u2022 <strong>Feb 28</strong> \u2014 Streamer Workshop: Branding 101 (5 PM EST)<br />
              \u2022 <strong>Mar 1</strong> \u2014 Networking Coffee Hour (10 AM EST)<br />
              \u2022 <strong>Mar 15</strong> \u2014 Guild Hall Meeting (7 PM EST)</p>

              <h2>\ud83d\udce3 Until Next Week</h2>
              <p>Thank you for being part of this amazing community. Whether you&apos;re a brand new Guildie or a founding member, you make this space special. See you in Discord!</p>
              <p>With love,<br /><em>The {guild.shortName} Newsletter Team</em></p>
            </div>
          </div>
        </section>

        {/* ===== ARCHIVE SECTION ===== */}
        <section className={`page-section ${activeSection === "archive" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">\ud83d\udcda Newsletter Archive</h2>
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Browse all past newsletter issues from the {guild.name}.
          </p>
          <div className="archive-grid">
            {SAMPLE_ARCHIVE.map((issue) => (
              <div key={issue.num} className="archive-card" onClick={() => showSection("newsletter")}>
                <div className="archive-date">ISSUE #{issue.num} \u00b7 {issue.date}</div>
                <div className="archive-title">{issue.title}</div>
                <div className="archive-preview">Click to read the full issue \u2192</div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== ANNOUNCEMENTS SECTION ===== */}
        <section className={`page-section ${activeSection === "announcements" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">\ud83d\udce3 Announcements</h2>
          </div>
          {SAMPLE_ANNOUNCEMENTS.map((ann, i) => (
            <div key={i} className={`ann-item ${ann.pinned ? "pinned" : ""}`}>
              <div className="ann-icon">{ann.icon}</div>
              <div className="ann-body">
                <div className="ann-title">
                  {ann.title}
                  {ann.pinned && <span className="pin-badge">PINNED</span>}
                </div>
                <div className="ann-text">{ann.text}</div>
                <div className="ann-date">{ann.date}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ===== EVENTS SECTION ===== */}
        <section className={`page-section ${activeSection === "events" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">\ud83d\udcc5 Upcoming Events</h2>
          </div>

          {/* Calendar Widget */}
          <div className="cal-widget">
            <div className="cal-header">
              <div className="cal-title">February 2026</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div className="cal-nav-btn">&lt;</div>
                <div className="cal-nav-btn">&gt;</div>
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
          <div className="grid-2" style={{ marginTop: "24px" }}>
            {SAMPLE_EVENTS.map((evt, i) => (
              <div key={i} className="event-card">
                <div className="event-date-badge">
                  <span className="event-day">{evt.day}</span>
                  <span className="event-month">{evt.month}</span>
                </div>
                <div className="event-name">{evt.name}</div>
                <div className="event-time">\ud83d\udd52 {evt.time} \u00b7 {evt.location}</div>
                <div className="event-desc">{evt.desc}</div>
                <div className="cal-buttons">
                  <a className="cal-btn" href="#" onClick={(e) => e.preventDefault()}>Google</a>
                  <a className="cal-btn" href="#" onClick={(e) => e.preventDefault()}>Apple</a>
                  <a className="cal-btn" href="#" onClick={(e) => e.preventDefault()}>Outlook</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SPOTLIGHT SECTION ===== */}
        <section className={`page-section ${activeSection === "spotlight" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">\u2728 Guildie Spotlight</h2>
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Each week we celebrate an outstanding member of the {guild.name}.
          </p>
          <div className="spotlight-card">
            <div className="spotlight-avatar">\ud83c\udf38</div>
            <div className="spotlight-content">
              <div className="spotlight-week">\u2728 {SAMPLE_SPOTLIGHT.week} \u2014 Current Spotlight</div>
              <div className="spotlight-name">{SAMPLE_SPOTLIGHT.name}</div>
              <div className="spotlight-handle">{SAMPLE_SPOTLIGHT.handle}</div>
              <div className="spotlight-blurb">{SAMPLE_SPOTLIGHT.blurb}</div>
              <div className="spotlight-achievement">{guild.emoji} {SAMPLE_SPOTLIGHT.achievement}</div>
            </div>
          </div>

          <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "18px", fontWeight: 700, color: "var(--guild-text)", margin: "32px 0 16px" }}>Past Spotlights</h3>
          <div className="grid-2">
            {SAMPLE_PAST_SPOTLIGHTS.map((sp, i) => (
              <div key={i} className="card">
                <div className="card-top" />
                <div className="card-body">
                  <span className="card-tag">{sp.date}</span>
                  <div className="card-title">{sp.name}</div>
                  <div className="card-excerpt">{sp.excerpt}</div>
                  <div className="card-meta">
                    <span className="card-date">{sp.category}</span>
                    <button className="read-btn">View \u2192</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== RECAPS SECTION ===== */}
        <section className={`page-section ${activeSection === "recaps" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">\ud83c\udfdb\ufe0f Guild Hall Recaps</h2>
          </div>
          <p style={{ color: "var(--guild-text2)", marginBottom: "24px" }}>
            Missed a meeting? Catch up on everything discussed at our monthly Guild Hall sessions.
          </p>
          {SAMPLE_RECAPS.map((recap, i) => (
            <div key={i} className="recap-card">
              <div className="recap-month">{recap.month}</div>
              <div className="recap-title">{recap.title}</div>
              <div className="recap-summary">{recap.summary}</div>
              <div className="recap-topics">
                {recap.topics.map((topic, j) => (
                  <span key={j} className="topic-chip">{topic}</span>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ===== HIGHLIGHTS SECTION ===== */}
        <section className={`page-section ${activeSection === "highlights" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">\ud83c\udf1f Guild Event Highlights</h2>
          </div>
          <div className="grid-3">
            {SAMPLE_HIGHLIGHTS.map((hl, i) => (
              <div key={i} className="highlight-card">
                <div className="highlight-img">{hl.emoji}</div>
                <div className="highlight-body">
                  <div className="highlight-event">{hl.event}</div>
                  <div className="highlight-title">{hl.title}</div>
                  <div className="highlight-date">{hl.date}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== STREAMS SECTION ===== */}
        <section className={`page-section ${activeSection === "streams" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">\ud83c\udfae Live Streams</h2>
          </div>
          <div className="stream-section">
            <div className="stream-header">
              <span>\ud83c\udfae {guild.name} \u2014 Twitch Team</span>
              <div className="stream-live-badge">
                <div className="live-dot" />
                LIVE
              </div>
            </div>
            <div className="stream-placeholder">
              <div style={{ fontSize: "48px", opacity: 0.4 }}>\ud83d\udcfa</div>
              <div style={{ fontWeight: 600, color: "var(--b)" }}>
                Twitch Team: twitch.tv/team/{guild.slug === "women" ? "womensguild" : guild.slug + "guild"}
              </div>
              <a
                href={`https://twitch.tv/team/${guild.slug === "women" ? "womensguild" : guild.slug + "guild"}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--b)", textDecoration: "underline", marginTop: "8px" }}
              >
                Open Twitch Team \u2192
              </a>
            </div>
          </div>
        </section>

        {/* ===== ADMIN SECTION ===== */}
        <section className={`page-section ${activeSection === "admin" ? "active" : ""}`}>
          <div className="section-header">
            <h2 className="section-title">\u2699\ufe0f Admin Panel</h2>
          </div>
          <div className="grid-2">
            <div className="admin-panel">
              <div className="admin-header">\ud83d\udcf0 Newsletter Posts</div>
              <div className="admin-actions" style={{ flexDirection: "column" }}>
                <button className="admin-btn create">\u270f\ufe0f Create New Newsletter Post</button>
                <button className="admin-btn edit">\ud83d\udccb Manage Drafts</button>
                <button className="admin-btn edit">\ud83d\udcda Edit Published Issues</button>
              </div>
            </div>
            <div className="admin-panel">
              <div className="admin-header">\ud83d\udcc5 Events &amp; Calendar</div>
              <div className="admin-actions" style={{ flexDirection: "column" }}>
                <button className="admin-btn create">\u2795 Add New Event</button>
                <button className="admin-btn edit">\u270f\ufe0f Edit Events</button>
                <button className="admin-btn edit">\ud83d\uddd1\ufe0f Remove Past Events</button>
              </div>
            </div>
            <div className="admin-panel">
              <div className="admin-header">\u2728 Guildie Spotlight</div>
              <div className="admin-actions" style={{ flexDirection: "column" }}>
                <button className="admin-btn create">\u2728 Set This Week&apos;s Spotlight</button>
                <button className="admin-btn edit">\ud83d\udcf7 Upload Member Avatar</button>
                <button className="admin-btn edit">\ud83d\udcd6 Edit Past Spotlights</button>
              </div>
            </div>
            <div className="admin-panel">
              <div className="admin-header">\ud83d\udce3 Announcements</div>
              <div className="admin-actions" style={{ flexDirection: "column" }}>
                <button className="admin-btn create">\ud83d\udce3 Post Announcement</button>
                <button className="admin-btn edit">\ud83d\udccc Pin / Unpin</button>
                <button className="admin-btn edit">\ud83d\uddd1\ufe0f Remove Announcement</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Event Popup Overlay */}
      {showEventPopup && popupDay && (
        <div className="event-popup-overlay show" onClick={() => setShowEventPopup(false)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-date-title">February {popupDay.day}, 2026</div>
              <div className="popup-close" onClick={() => setShowEventPopup(false)}>\u2715</div>
            </div>
            <div className="popup-events">
              {popupDay.events.map((evt, i) => (
                <div key={i} className="popup-event">
                  <div className="popup-event-name">{evt.name}</div>
                  <div className="popup-event-time">{evt.time} \u00b7 {evt.location}</div>
                  <div className="popup-event-desc">{evt.desc}</div>
                  <div className="popup-event-actions">
                    <a className="cal-btn" href="#" onClick={(e) => e.preventDefault()}>Google</a>
                    <a className="cal-btn" href="#" onClick={(e) => e.preventDefault()}>Apple</a>
                    <a className="cal-btn" href="#" onClick={(e) => e.preventDefault()}>Outlook</a>
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
