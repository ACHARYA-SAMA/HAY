import { createFileRoute, Link } from "@tanstack/react-router";
import { listListings } from "@/services";
import { parseCatalogSearch, sectionNames } from "@/services/navigation";
import { filterListings } from "@/services/catalog";
import { categories } from "@/services/types";
import { ListingCard } from "@/components/listing-card";
import { CatalogPending, CatalogError } from "@/components/catalog-page";
import { GlobalSearch } from "@/components/global-search";
export const Route = createFileRoute("/search")({
  validateSearch: parseCatalogSearch,
  loader: listListings,
  pendingComponent: CatalogPending,
  errorComponent: ({ reset }) => <CatalogError reset={reset} />,
  head: () => ({ meta: [{ title: "Search every counter — HAY" }] }),
  component: SearchPage,
});
function SearchPage() {
  const search = Route.useSearch(),
    listings = Route.useLoaderData(),
    results = filterListings(listings, { q: search.q, cat: search.cat });
  return (
    <div className="page-shell">
      <section className="section">
        <p className="eyebrow">Every counter. One search.</p>
        <h1 className="section-title mt-5">
          {search.q ? "FOUND AT THE COUNTER." : "WHAT’S THE PLAN?"}
        </h1>
        <p className="my-6 font-mono">
          {results.length} RESULTS{search.q ? " FOR “" + search.q + "”" : ""}
        </p>
        <GlobalSearch hero />
        <nav className="filter-chips mt-8" aria-label="Search categories">
          <Link
            className="clicky clicky--sm"
            to="/search"
            search={{ q: search.q }}
            aria-current={!search.cat ? "page" : undefined}
          >
            ALL
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              className={"clicky clicky--sm clicky--" + cat}
              to="/search"
              search={{ q: search.q, cat }}
              aria-current={search.cat === cat ? "page" : undefined}
            >
              {sectionNames[cat]}
            </Link>
          ))}
        </nav>
      </section>
      <section className="section">
        {results.length ? (
          <div className="catalog-grid">
            {results.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="empty-counter">
            <h2 className="section-title">
              NO STUBS.
              <br />
              YET.
            </h2>
            <p className="my-6">
              That counter is quiet. Try a city, station code, or a shorter title.
            </p>
            <Link className="clicky" to="/search" search={{}}>
              SHOW EVERY TICKET
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
