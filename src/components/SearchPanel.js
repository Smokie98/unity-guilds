"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const SECTION_LABELS = {
  newsletters: { icon: "\ud83d\udcf0", label: "Newsletters", section: "newsletter" },
  events: { icon: "\ud83d\udcc5", label: "Events", section: "events" },
  announcements: { icon: "\ud83d\udce3", label: "Announcements", section: "announcements" },
  spotlights: { icon: "\u2728", label: "Spotlights", section: "spotlight" },
  recaps: { icon: "\ud83c\udfdb\ufe0f", label: "Recaps", section: "recaps" },
  highlights: { icon: "\ud83c\udf1f", label: "Highlights", section: "highlights" },
};

export default function SearchPanel({ guild, onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const debounceRef = useRef(null);

  // Build flat list of all results for keyboard nav
  const flatResults = [];
  if (results) {
    Object.entries(results.results || {}).forEach(([type, items]) => {
      items.forEach((item) => {
        flatResults.push({ type, item, sectionInfo: SECTION_LABELS[type] });
      });
    });
  }

  // Debounced search
  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&guild=${guild}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setOpen(true);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [guild]);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setFocusIdx(-1);
    // Debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && focusIdx >= 0) {
      e.preventDefault();
      selectResult(flatResults[focusIdx]);
    }
  }

  function selectResult(r) {
    setOpen(false);
    setQuery("");
    setResults(null);
    if (onNavigate && r.sectionInfo) {
      onNavigate(r.sectionInfo.section);
    }
  }

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function getSnippet(item, type) {
    // Return a short snippet of matching content
    const text = item.title || item.member_name || item.content || item.description || item.summary || item.bio || "";
    if (text.length > 100) return text.substring(0, 100) + "...";
    return text;
  }

  function getTitle(item, type) {
    if (type === "spotlights") return item.member_name || "Spotlight";
    return item.title || "Untitled";
  }

  return (
    <div ref={panelRef} className="search-panel" style={{ position: "relative" }}>
      <div className="search-bar">
        <span style={{ color: "var(--guild-muted)" }}>{"\ud83d\udd0d"}</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search newsletters, events, spotlights..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results && results.totalResults > 0) setOpen(true); }}
        />
        {loading && (
          <span style={{ color: "var(--guild-muted)", fontSize: "12px" }}>...</span>
        )}
      </div>

      {/* Results Dropdown */}
      {open && results && (
        <div className="search-results-dropdown">
          {results.totalResults === 0 ? (
            <div className="search-no-results">
              No results found for &ldquo;{results.query}&rdquo;
            </div>
          ) : (
            <>
              {Object.entries(results.results).map(([type, items]) => {
                if (items.length === 0) return null;
                const info = SECTION_LABELS[type];
                return (
                  <div key={type} className="search-group">
                    <div className="search-group-title">
                      {info?.icon} {info?.label || type}
                    </div>
                    {items.map((item, i) => {
                      const globalIdx = flatResults.findIndex(
                        (r) => r.type === type && r.item === item
                      );
                      return (
                        <div
                          key={item.id || i}
                          className={`search-result-item ${globalIdx === focusIdx ? "focused" : ""}`}
                          onClick={() => selectResult({ type, item, sectionInfo: info })}
                          onMouseEnter={() => setFocusIdx(globalIdx)}
                        >
                          <div className="search-result-title">{getTitle(item, type)}</div>
                          <div className="search-result-snippet">{getSnippet(item, type)}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              <div className="search-footer">
                {results.totalResults} result{results.totalResults !== 1 ? "s" : ""} found
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
