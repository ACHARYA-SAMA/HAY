import { EMPTY_SEATS, useAppStore } from "@/stores/app-store";

import { berthLabel, isInventorySeatTaken, priceSeats } from "@/services/checkout";

import type { Listing } from "@/services/types";

const rows = "ABCDEFGH".split("");

const demo = { id: "print-room", category: "movie" as const, price: 320 };

export function SeatMap({
  listing = demo,
}: {
  listing?: Pick<Listing, "id" | "price" | "category" | "fares">;
}) {
  const travelClass = useAppStore((s) => s.classByListing[listing.id]);

  const selected = useAppStore((s) => s.selectedByListing[listing.id] ?? EMPTY_SEATS),
    toggle = useAppStore((s) => s.toggleSeat),
    purchased = useAppStore((s) => s.purchasedTickets);

  return (
    <div>
      <div className="screen-line">
        {listing.category === "movie"
          ? "SCREEN"
          : listing.category === "train"
            ? "BERTHS · LB LOWER / MB MIDDLE / UB UPPER / SL SIDE LOWER / SU SIDE UPPER"
            : "SEAT SELECTION"}
      </div>
      <div
        className="seat-scroll mt-8"
        tabIndex={0}
        role="region"
        aria-label="Seat map, scroll horizontally for more seats"
      >
        <div role="grid" aria-label="Seats" className="seat-grid grid gap-2">
          {rows.map((row) => (
            <div
              role="row"
              className={
                listing.category === "train"
                  ? "berth-row"
                  : "grid grid-cols-[2rem_repeat(8,1fr)] gap-2"
              }
              key={row}
            >
              <b className="self-center font-mono">{row}</b>
              {Array.from({ length: listing.category === "train" ? 5 : 8 }, (_, i) => {
                const id = `${row}${i + 1}`,
                  taken =
                    isInventorySeatTaken(id) ||
                    purchased.some(
                      (t) =>
                        t.listingId === listing.id &&
                        t.seat === id &&
                        (!t.travelClass || t.travelClass === travelClass),
                    ),
                  isSelected = selected.includes(id),
                  price = priceSeats(listing, [id], travelClass).items[0]!.price;
                return (
                  <button
                    key={id}
                    type="button"
                    role="gridcell"
                    aria-label={`Row ${row}, seat ${i + 1}, ${listing.category === "train" ? berthLabel(id) : ""}, ₹${price}, ${taken ? "taken" : isSelected ? "selected" : "available"}`}
                    aria-selected={isSelected}
                    disabled={taken}
                    onClick={() => toggle(listing.id, id)}
                    className={`seat clicky clicky--seat clicky--${listing.category} ${taken ? "seat-taken" : isSelected ? "seat-selected" : ""}`}
                  >
                    {taken ? (
                      <span aria-hidden="true">×</span>
                    ) : listing.category === "train" ? (
                      ["LB", "MB", "UB", "SL", "SU"][i]
                    ) : (
                      i + 1
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs font-bold">
        <span>□ AVAILABLE</span>
        <span>■ SELECTED</span>
        <span>▧ TAKEN</span>
      </div>
    </div>
  );
}
