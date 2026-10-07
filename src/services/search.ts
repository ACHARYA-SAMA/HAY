import { filterListings, isTravel } from "./catalog";
import { sectionNames } from "./navigation";
import type { Listing } from "./types";
export type Suggestion = {
  group: string;
  label: string;
  hint: string;
  listing?: Listing;
  query?: string;
};
export function searchSuggestions(listings: Listing[], query: string): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const groups = new Map<string, Suggestion[]>();
  for (const l of filterListings(listings, { q })) {
    const group = isTravel(l) ? "Routes" : sectionNames[l.category];
    const entries = groups.get(group) ?? [];
    if (entries.length < 3)
      entries.push({
        group,
        label: l.from ? `${l.from.city} → ${l.to?.city}` : l.title,
        hint: l.operator ?? l.venue,
        listing: l,
      });
    groups.set(group, entries);
  }
  const locations = new Map<string, Suggestion>();
  for (const l of listings)
    for (const place of [l.from, l.to])
      if (place && `${place.city} ${place.code} ${place.name}`.toLowerCase().includes(q)) {
        const label = `${place.city} (${place.code})`;
        locations.set(label, {
          group: "Cities / stations",
          label,
          hint: place.name,
          query: place.code,
        });
      }
  return [...groups.values()].flat().concat([...locations.values()].slice(0, 4));
}
