import type { CatalogSearch } from "@/services/navigation";
import { Link } from "@tanstack/react-router";
import type { Listing } from "@/services/types";
import { TravelFacts } from "./travel-facts";
import { money, shortDate } from "@/lib/format";
export function ProductDetail({
  listing: l,
  search = {},
}: {
  listing: Listing;
  search?: CatalogSearch;
}) {
  return (
    <div className={"page-shell ticket-" + l.category}>
      <section className={"section bg-" + l.category}>
        <p className="eyebrow">
          {l.category} / {l.tag}
        </p>
        <h1 className="section-title mt-5">{l.title}</h1>
        <p className="mt-5 font-bold">
          {l.from ? l.from.city + " → " + l.to?.city : l.venue + " · " + l.city}
        </p>
      </section>
      <section className="section">
        <TravelFacts listing={l} />
        {l.showings ? (
          <>
            <h2 className="text-3xl font-black">PICK YOUR SCREEN.</h2>
            <div className="grid gap-6 mt-8">
              {l.showings.map((s) => (
                <article className="block-card" key={s.venue}>
                  <h3 className="text-2xl font-black">{s.venue}</h3>
                  <p className="my-4">
                    {s.language} · {s.format} · {shortDate(l.date)}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {s.times.map((time) => (
                      <Link
                        key={time}
                        to="/book/$id"
                        params={{ id: l.id }}
                        search={{ venue: s.venue, time }}
                        className="clicky clicky--sm clicky--movie"
                      >
                        {time} · {money.format(l.price)}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="my-6 font-bold">
              {l.from
                ? "Choose your class and seats at the next counter."
                : l.venue + " · " + shortDate(l.date) + " · " + l.time}
            </p>
            {l.fares && (
              <div className="flex flex-wrap gap-3 my-6">
                {l.fares.map((f) => (
                  <span key={f.code} className="fare-chip">
                    {f.code} · {f.availability} · {money.format(f.price)}
                  </span>
                ))}
              </div>
            )}
            <Link
              to="/book/$id"
              params={{ id: l.id }}
              search={search}
              className={"clicky clicky--primary clicky--ink clicky--" + l.category}
            >
              CHOOSE SEATS · FROM {money.format(l.price)}
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
