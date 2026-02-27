"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const SECTION_LABELS = {
  newsletters: { icon: "\ud83d\udcf0", label: "Newsletters", section: "newsletter" },
  events: { icon: "\ud83d\udcc5", label: "Events", section: "events" },
  announcements: { icon: "\ud83d\udce3", label: "Announcements", section: "announcements" },
  spotlights: { icon: "\u2728", label: "Spotlights", section: "spotlight" },
  recaps: { icon: "\ud83c\udfdb\ufe0f", label: "Recaps", section: "recaps" },
  highlights: { icon: "\ud83c\udf1f", label: "Highlights", section: "highlights" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  if (isNaN(d)) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const guild = searchParams.get("guild") || "";
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}&guild=${encodeURIComponent(guild)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [query, guild]);

  return (
    <div className="search-results-page">
      <Link href={guild ? `/${guild}` : "/"} className="back-nav">
        {"\u2190"} {guild ? "Back to Guild" : "Home"}
      </Link>

      <h1 className="search-results-title">
        Search Results for &ldquo;{query}&rdquo;
      </h1>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>{"\ud83d\udd0d"}</div>
          Searching...
        </div>
      )}

      {!loading && !results && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          Enter a search term to find content.
        </div>
      )}

      {!loading && results && results.totalResults === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>{"\ud83d\ude14"}</div>
          No results found for &ldquo;{query}&rdquo;
        </div>
      )}

      {!loading && results && results.totalResults > 0 && (
        <>
          <div className="search-results-count">
            {results.totalResults} result{results.totalResults !== 1 ? "s" : ""} found
          </div>
          {Object.entries(results.results).map(([type, items]) => {
            if (!items || items.length === 0) return null;
            const info = SECTION_LABELS[type];
            return (
              <div key={type} className="search-results-group">
                <div className="search-results-group-title">
                  {info?.icon} {info?.label || type}
                </div>
                {items.map((item, i) => (
                  <Link
                    key={item.id || i}
                    href={guild ? `/${guild}?section=${info?.section || type}` : "/"}
                    className="search-result-card"
                  >
                    <div className="search-result-card-title">
                      {type === "spotlights" ? (item.member_name || "Spotlight") : (item.title || "Untitled")}
                    </div>
                    <div className="search-result-card-snippet">
                      {(() => {
                        const text = item.title || item.member_name || item.content || item.description || item.summary || item.bio || "";
                        return text.length > 200 ? text.substring(0, 200) + "..." : text;
                      })()}
                    </div>
                    <div className="search-result-card-meta">
                      {info?.icon} {info?.label} {item.created_at || item.published_at || item.event_date ? ` \u00b7 ${formatDate(item.created_at || item.published_at || item.event_date)}` : ""}
                    </div>
                  </Link>
                ))}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <div className="bg-mesh">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>
      <Suspense fallback={
        <div className="search-results-page">
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>{"\ud83d\udd0d"}</div>
            Loading search...
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </>
  );
}
