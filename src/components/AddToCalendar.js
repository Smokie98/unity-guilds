"use client";

import { useState, useRef, useEffect } from "react";

// Formats a date + time string for calendar URLs
// event_date: "2026-03-15", event_time: "7:00 PM EST", duration defaults to 2 hours
function parseDateTime(eventDate, eventTime) {
  if (!eventDate) return { start: null, end: null };

  // Parse the date
  const [year, month, day] = eventDate.split("-").map(Number);

  // Parse time, default to 19:00 if not provided
  let hours = 19, minutes = 0;
  if (eventTime) {
    const timeMatch = eventTime.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2] || "0");
      const ampm = (timeMatch[3] || "").toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
  }

  const start = new Date(year, month - 1, day, hours, minutes);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // default 2h duration

  return { start, end };
}

// Format date for Google Calendar URL: 20260315T190000Z (UTC)
function formatGoogleDate(date) {
  if (!date) return "";
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Format date for Outlook URL: 2026-03-15T19:00:00
function formatOutlookDate(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

// Format date for ICS: 20260315T190000
function formatICSDate(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

// Generate .ics file content
function generateICS(event, start, end) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Unity Guilds//Events//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${(event.title || "Event").replace(/[,;\\]/g, " ")}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n").replace(/[,;\\]/g, " ")}`,
    `LOCATION:${(event.location || "").replace(/[,;\\]/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export default function AddToCalendar({ event, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  if (!event || !event.event_date) return null;

  const { start, end } = parseDateTime(event.event_date, event.event_time);
  if (!start || !end) return null;

  const title = encodeURIComponent(event.title || "Event");
  const description = encodeURIComponent(event.description || "");
  const location = encodeURIComponent(event.location || "");

  // Google Calendar
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}&details=${description}&location=${location}`;

  // Outlook
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${formatOutlookDate(start)}&enddt=${formatOutlookDate(end)}&body=${description}&location=${location}`;

  // Apple / .ics download
  function downloadICS() {
    const icsContent = generateICS(event, start, end);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(event.title || "event").replace(/\s+/g, "-").toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  if (compact) {
    // Compact mode: just show the 3 buttons inline (for event cards)
    return (
      <div className="cal-buttons">
        <a className="cal-btn" href={googleUrl} target="_blank" rel="noopener noreferrer">Google</a>
        <a className="cal-btn" href={outlookUrl} target="_blank" rel="noopener noreferrer">Outlook</a>
        <a className="cal-btn" href="#" onClick={(e) => { e.preventDefault(); downloadICS(); }}>.ics</a>
      </div>
    );
  }

  // Dropdown mode: button with dropdown options
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        className="cal-btn"
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: "4px" }}
      >
        {"\ud83d\udcc5"} Add to Calendar {open ? "\u25b2" : "\u25bc"}
      </button>
      {open && (
        <div className="atc-dropdown">
          <a
            className="atc-option"
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span className="atc-icon">{"\ud83d\udfe5"}</span> Google Calendar
          </a>
          <a
            className="atc-option"
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span className="atc-icon">{"\ud83d\udfe6"}</span> Outlook
          </a>
          <a
            className="atc-option"
            href="#"
            onClick={(e) => { e.preventDefault(); downloadICS(); }}
          >
            <span className="atc-icon">{"\u2b1c"}</span> Apple Calendar (.ics)
          </a>
        </div>
      )}
    </div>
  );
}
