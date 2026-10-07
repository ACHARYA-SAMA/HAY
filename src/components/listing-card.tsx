import { Link } from "@tanstack/react-router";
import type { Listing } from "@/services/types";
import { money, shortDate } from "@/lib/format";
import { type CatalogSearch, detailPaths as paths } from "@/services/navigation";
export function ListingCard({
  listing: l,
  search = {},
}: {
  listing: Listing;
  search?: CatalogSearch;
}) {
  return (
    <article className={"route-card listing-card ticket-" + l.category}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={"category-tag ticket-" + l.category}>{l.category}</span>
        <span className="font-mono text-xs">
          {shortDate(l.date)} · {l.time}
        </span>
      </div>
      <h2 className="mt-5 text-2xl font-black uppercase">
        {l.from && l.to ? l.from.city + " → " + l.to.city : l.title}
      </h2>
      <p className="mt-2">{l.operator ?? l.venue}</p>
      {l.from && l.to && (
        <p className="mt-3 font-mono text-xs">
          {l.from.code} → {l.to.code} · {Math.floor((l.duration ?? 0) / 60)}h{" "}
          {(l.duration ?? 0) % 60}m
        </p>
      )}
      {l.fares && (
        <div className="mt-4 flex flex-wrap gap-2">
          {l.fares.map((f) => (
            <span key={f.code} className="fare-chip">
              {f.code} · {f.availability}
            </span>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
        <b className="font-mono">FROM {money.format(l.price)}</b>
        <Link
          className={"clicky clicky--sm clicky--" + l.category}
          to={paths[l.category]}
          params={{ id: l.id }}
          search={search}
        >
          VIEW DETAILS
        </Link>
      </div>
    </article>
  );
}
