import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InkSelect, SquareCheck } from "@/components/ink-controls";
import { ListingCard } from "@/components/listing-card";
import { filterListings } from "@/services/catalog";
import { sectionNames, sectionPaths, type CatalogSearch } from "@/services/navigation";
import { fixtureDate } from "@/services/fixture-dates";
import type { Category, Listing } from "@/services/types";
import { shortDate } from "@/lib/format";
const options = (values: string[]) => [
  { value: "", label: "Any" },
  ...values.map((value) => ({ value, label: value })),
];
export function CatalogPending() {
  return (
    <section className="section" role="status">
      <h1 className="section-title">CHECKING THE COUNTER.</h1>
      <p className="mt-5">Finding departures and open seats…</p>
    </section>
  );
}
export function CatalogError({ reset }: { reset: () => void }) {
  return (
    <section className="section">
      <h1 className="section-title">COUNTER PAUSED.</h1>
      <p className="my-6">The listings did not load. Try once more.</p>
      <Button onClick={reset}>TRY AGAIN</Button>
    </section>
  );
}
export function CatalogPage({
  category,
  search,
  listings,
}: {
  category?: Category;
  search: CatalogSearch;
  listings: Listing[];
}) {
  const travel = !!category && ["bus", "train", "flight"].includes(category),
    navigate = useNavigate(),
    [draft, setDraft] = useState(search);
  useEffect(() => setDraft(search), [search]);
  const path = category ? sectionPaths[category] : "/explore";
  const update = (patch: Partial<CatalogSearch>) => {
    void navigate({ to: path, search: { ...search, ...patch }, resetScroll: false });
  };
  const filters = {
    ...search,
    cat: category ?? search.cat,
    city: travel ? undefined : (search.city ?? "Hyderabad"),
    from: travel ? (search.from ?? "Hyderabad") : undefined,
  };
  const results = filterListings(listings, filters);
  const source = listings.filter((l) => !category || l.category === category),
    unique = (key: "operator" | "boardingPoint") => [
      ...new Set(source.map((l) => l[key]).filter((v): v is string => !!v)),
    ];
  const chip = (key: "language" | "format" | "genre" | "sport", values: string[]) => (
    <fieldset className="filter-chips">
      <legend>{key.toUpperCase()}</legend>
      {values.map((value) => (
        <button
          type="button"
          key={value}
          className={"clicky clicky--sm " + (category ? "clicky--" + category : "")}
          aria-pressed={search[key] === value}
          onClick={() => update({ [key]: search[key] === value ? undefined : value })}
        >
          {value}
        </button>
      ))}
    </fieldset>
  );
  const select = (label: string, key: keyof CatalogSearch, values: string[]) => (
    <InkSelect
      label={label}
      value={String(search[key] ?? "")}
      options={options(values)}
      onChange={(v) => update({ [key]: v || undefined })}
    />
  );
  return (
    <div className={"page-shell section-page " + (category ? "ticket-" + category : "")}>
      <section className="section catalog-heading">
        <p className="eyebrow">
          {travel ? "A seat out of town." : "Something worth showing up for."}
        </p>
        <h1 className="section-title">{category ? sectionNames[category] : "Every counter."}</h1>
        <form
          className="catalog-search mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            update(draft);
          }}
        >
          {travel ? (
            <>
              <label>
                FROM
                <input
                  className="hard-field"
                  value={draft.from ?? "Hyderabad"}
                  onChange={(e) => setDraft({ ...draft, from: e.target.value })}
                  placeholder="City or station"
                />
              </label>
              <button
                type="button"
                className="clicky swap-control"
                aria-label="Swap origin and destination"
                onClick={() =>
                  setDraft({ ...draft, from: draft.to ?? "", to: draft.from ?? "Hyderabad" })
                }
              >
                ⇄
              </button>
              <label>
                TO
                <input
                  className="hard-field"
                  value={draft.to ?? ""}
                  onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                  placeholder="Any destination"
                />
              </label>
            </>
          ) : (
            <label>
              CITY
              <input
                className="hard-field"
                value={draft.city ?? "Hyderabad"}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              />
            </label>
          )}
          <label>
            DATE
            <input
              type="date"
              className="hard-field"
              value={draft.date ?? ""}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </label>
          {(category === "bus" || category === "flight") && (
            <label>
              PASSENGERS
              <input
                type="number"
                min="1"
                max="6"
                className="hard-field"
                value={draft.passengers ?? 1}
                onChange={(e) => setDraft({ ...draft, passengers: Number(e.target.value) })}
              />
            </label>
          )}
          <Button type="submit">SEARCH</Button>
        </form>
        {category === "movie" && (
          <div className="date-strip mt-6" aria-label="Choose a date">
            <button
              className="clicky clicky--sm"
              aria-pressed={!search.date}
              onClick={() => update({ date: undefined })}
            >
              ANY DAY
            </button>
            {Array.from({ length: 7 }, (_, i) => {
              const date = fixtureDate(i),
                key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
                  new Date(date),
                );
              return (
                <button
                  className="clicky clicky--sm"
                  key={key}
                  aria-pressed={search.date === key}
                  onClick={() => update({ date: key })}
                >
                  {shortDate(date)}
                </button>
              );
            })}
          </div>
        )}
      </section>
      <section className="section catalog-body">
        {search.expired && (
          <p role="alert" className="mb-6 font-bold">
            Your hold expired. Seats released; choose a new ticket.
          </p>
        )}
        <div className="catalog-filters">
          {!category && (
            <div className="filter-chips">
              {Object.entries(sectionNames).map(([cat, name]) => (
                <button
                  className="clicky clicky--sm"
                  key={cat}
                  aria-pressed={search.cat === cat}
                  onClick={() =>
                    update({ cat: search.cat === cat ? undefined : (cat as Category) })
                  }
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          {category === "movie" && (
            <>
              {chip("language", ["Telugu", "Hindi", "Tamil", "English"])}
              {chip("format", ["2D", "IMAX", "Dolby"])}
            </>
          )}
          {category === "event" && chip("genre", ["Indie", "Jazz", "Electronic", "Classical"])}
          {category === "sport" &&
            chip("sport", [
              "Cricket",
              "Football",
              "Tennis",
              "Athletics",
              "Badminton",
              "Basketball",
            ])}
          {(!category || category === "event" || category === "sport") && (
            <label className="price-filter">
              MAX PRICE: ₹{search.maxPrice ?? 20000}
              <input
                className="ink-range"
                type="range"
                min="0"
                max="20000"
                step="100"
                value={draft.maxPrice ?? search.maxPrice ?? 20000}
                onChange={(e) => setDraft({ ...draft, maxPrice: Number(e.target.value) })}
                onPointerUp={(e) => update({ maxPrice: Number(e.currentTarget.value) })}
                onKeyUp={(e) => update({ maxPrice: Number(e.currentTarget.value) })}
              />
            </label>
          )}
          {category === "bus" && (
            <>
              <div className="filter-chips">
                <SquareCheck
                  checked={search.ac === "AC"}
                  onChange={() => update({ ac: search.ac === "AC" ? undefined : "AC" })}
                >
                  AC
                </SquareCheck>
                <SquareCheck
                  checked={search.ac === "non-AC"}
                  onChange={() => update({ ac: search.ac === "non-AC" ? undefined : "non-AC" })}
                >
                  NON-AC
                </SquareCheck>
              </div>
              {select("SEAT TYPE", "seatType", ["Sleeper", "Seater"])}
              {select("BOARDING POINT", "boarding", unique("boardingPoint"))}
            </>
          )}
          {(category === "bus" || category === "flight") &&
            select("DEPARTURE", "window", ["morning", "evening"])}
          {category === "train" && (
            <>
              {select("CLASS", "travelClass", ["SL", "3A", "2A", "1A"])}
              {select("QUOTA", "quota", ["General", "Tatkal", "Ladies"])}
            </>
          )}
          {category === "flight" && (
            <>
              {select("CABIN", "cabin", ["Economy", "Premium", "Business"])}
              {select("STOPS", "stops", ["0", "1", "2"])}
              {select("AIRLINE", "operator", unique("operator"))}
            </>
          )}
        </div>
        <div className="catalog-results-header">
          <h2 className="font-mono text-sm font-bold" aria-live="polite">
            {results.length} RESULTS ON THE COUNTER
          </h2>
          <InkSelect
            label="SORT"
            value={search.sort ?? "soonest"}
            options={[
              { value: "soonest", label: "Soonest" },
              { value: "price", label: "Lowest price" },
              { value: "title", label: "A–Z" },
            ]}
            onChange={(sort) => update({ sort })}
          />
        </div>
        {results.length ? (
          <div className="catalog-grid">
            {results.map((l) => (
              <ListingCard key={l.id} listing={l} search={search} />
            ))}
          </div>
        ) : (
          <div className="block-card empty-counter">
            <h2 className="section-title">
              NO STUBS.
              <br />
              YET.
            </h2>
            <p className="my-6">Try nearby dates, another destination, or fewer filters.</p>
            <div className="flex flex-wrap gap-5">
              <button className="clicky" onClick={() => update({ date: undefined })}>
                TRY NEARBY DATES
              </button>
              <Link to={path} search={{}}>
                RESET FILTERS
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
