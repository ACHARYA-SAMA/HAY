import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { listListings } from "@/services";
import { searchSuggestions, type Suggestion } from "@/services/search";
import { detailPaths } from "@/services/navigation";
import type { Listing } from "@/services/types";
export function GlobalSearch({ hero = false }: { hero?: boolean }) {
  const [query, setQuery] = useState(""),
    [listings, setListings] = useState<Listing[]>([]),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1),
    [failed, setFailed] = useState(false),
    [loading, setLoading] = useState(true),
    input = useRef<HTMLInputElement>(null),
    id = useId(),
    navigate = useNavigate();
  const options = searchSuggestions(listings, query),
    visible = open && !!query.trim();
  useEffect(() => {
    let live = true;
    void listListings()
      .then((items) => {
        if (live) setListings(items);
      })
      .catch(() => {
        if (live) setFailed(true);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (hero) return;
    const focus = (e: KeyboardEvent) => {
      const editing =
        e.target instanceof HTMLElement &&
        !!e.target.closest('input,textarea,select,[contenteditable="true"]');
      if (
        (e.key === "/" && !editing) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener("keydown", focus);
    return () => document.removeEventListener("keydown", focus);
  }, [hero]);
  const submit = (suggestion?: Suggestion) => {
    setOpen(false);
    setActive(-1);
    if (suggestion?.listing) {
      const l = suggestion.listing;
      void navigate({ to: detailPaths[l.category], params: { id: l.id } });
    } else void navigate({ to: "/search", search: { q: suggestion?.query ?? query.trim() } });
  };
  return (
    <div
      className={hero ? "global-search hero-search" : "global-search header-search"}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <form
        className="search-form"
        role="search"
        aria-label={hero ? "Hero search" : "Global search"}
        onSubmit={(e) => {
          e.preventDefault();
          submit(visible && active >= 0 ? options[active] : undefined);
        }}
      >
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-label={hero ? "Search tickets" : "Find a ticket"}
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={id}
          aria-activedescendant={visible && active >= 0 ? id + "-" + active : undefined}
          autoComplete="off"
          value={query}
          placeholder={hero ? "Film, team, city or station" : "FIND A TICKET"}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
              setActive(-1);
            }
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && options.length) {
              e.preventDefault();
              setOpen(true);
              setActive(
                (i) => (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length,
              );
            }
          }}
        />
        <button
          type="submit"
          aria-label={hero ? "GO" : "Search all tickets"}
          className="clicky clicky--primary clicky--event search-go"
        >
          {hero ? "GO" : "↵"}
          {hero && <span aria-hidden="true">→</span>}
        </button>
      </form>
      {visible && (
        <div className="search-suggestions" id={id} role="listbox" aria-label="Ticket suggestions">
          {options.map((s, i) => (
            <div key={s.group + s.label + i}>
              {(i === 0 || options[i - 1]?.group !== s.group) && (
                <p className="suggestion-heading" role="presentation">
                  {s.group}
                </p>
              )}
              <button
                id={id + "-" + i}
                type="button"
                role="option"
                aria-selected={active === i}
                tabIndex={-1}
                className="suggestion"
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => submit(s)}
              >
                <b>{s.label}</b>
                <small>{s.hint}</small>
              </button>
            </div>
          ))}
          {!options.length && (
            <p className="search-empty">
              {loading
                ? "Checking the counter…"
                : failed
                  ? "Suggestions paused. Press Enter to search."
                  : "NO MATCH. YET. Try a city, station or title."}
            </p>
          )}
          <p className="search-help">↑ ↓ to browse · Enter to go · Esc to close</p>
        </div>
      )}
    </div>
  );
}
