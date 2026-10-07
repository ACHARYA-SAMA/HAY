import { expect, it } from "vitest";
import { getInventory } from "@/services/fixtures";
import { searchSuggestions } from "@/services/search";
it("finds station codes and groups route and location suggestions", () => {
  const items = searchSuggestions(getInventory().listings, "SC");
  expect(items.some((i) => i.group === "Routes")).toBe(true);
  expect(items.some((i) => i.group === "Cities / stations")).toBe(true);
});
it("finds fictional movie titles and returns nothing for whitespace", () => {
  const listings = getInventory().listings;
  expect(searchSuggestions(listings, "afterlight").some((i) => i.group === "Movies")).toBe(true);
  expect(searchSuggestions(listings, "  ")).toEqual([]);
});
