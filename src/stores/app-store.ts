import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  contactSchema,
  HOLD_DURATION,
  isInventorySeatTaken,
  priceSeats,
  passengerSchema,
  type BookingOptions,
  type Contact,
} from "@/services/checkout";
import type { Listing, TicketData } from "@/services/types";
type Theme = "system" | "light" | "dark";
type Store = {
  classByListing: Record<string, string>;
  chooseClass: (listingId: string, code: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  selectedByListing: Record<string, string[]>;
  holds: Record<string, number>;
  purchasedTickets: TicketData[];
  toggleSeat: (listingId: string, seat: string) => void;
  startHold: (listingId: string, now?: number) => void;
  release: (listingId: string) => void;
  purchase: (
    listing: Listing,
    contact: Contact,
    now?: number,
    options?: BookingOptions,
  ) => TicketData[];
};
export const EMPTY_SEATS: readonly string[] = [];
export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      classByListing: {},
      chooseClass: (id, code) => {
        get().release(id);
        set((s) => ({ classByListing: { ...s.classByListing, [id]: code } }));
      },
      theme: "system",
      setTheme: (theme) => set({ theme }),
      selectedByListing: {},
      holds: {},
      purchasedTickets: [],
      toggleSeat: (listingId, seat) =>
        set((s) => {
          if (
            s.holds[listingId] ||
            isInventorySeatTaken(seat) ||
            s.purchasedTickets.some(
              (t) =>
                t.listingId === listingId &&
                t.seat === seat &&
                (!t.travelClass || t.travelClass === s.classByListing[listingId]),
            )
          )
            return s;
          const seats = s.selectedByListing[listingId] ?? [];
          return {
            selectedByListing: {
              ...s.selectedByListing,
              [listingId]: seats.includes(seat)
                ? seats.filter((x) => x !== seat)
                : [...seats, seat],
            },
          };
        }),
      startHold: (listingId, now = Date.now()) =>
        set((s) =>
          !s.selectedByListing[listingId]?.length || s.holds[listingId]
            ? s
            : { holds: { ...s.holds, [listingId]: now + HOLD_DURATION } },
        ),
      release: (listingId) =>
        set((s) => {
          const selectedByListing = { ...s.selectedByListing },
            holds = { ...s.holds };
          delete selectedByListing[listingId];
          delete holds[listingId];
          return { selectedByListing, holds };
        }),
      purchase: (listing, contact, now = Date.now(), options = {}) => {
        contactSchema.parse(contact);
        const s = get(),
          expires = s.holds[listing.id];
        if (!expires || expires <= now) {
          s.release(listing.id);
          throw new Error("Your hold has expired. Choose seats again.");
        }
        const travelClass = s.classByListing[listing.id] ?? listing.fares?.[0]?.code;
        const fare = listing.fares?.find((f) => f.code === travelClass);
        if (listing.fares && (!fare || fare.seats === 0))
          throw new Error("That class is unavailable.");
        const seats = s.selectedByListing[listing.id] ?? [];
        if (!seats.length) throw new Error("Choose at least one seat.");
        if (
          seats.some(
            (seat) =>
              isInventorySeatTaken(seat) ||
              s.purchasedTickets.some(
                (t) =>
                  t.listingId === listing.id &&
                  t.seat === seat &&
                  (!t.travelClass || t.travelClass === travelClass),
              ),
          )
        )
          throw new Error("A selected seat is no longer available.");
        if (fare && seats.length > fare.seats) throw new Error("Not enough seats in this class.");
        const passengers = options.passengers ?? [];
        if (
          listing.category === "train" &&
          (passengers.length !== seats.length ||
            passengers.some((p) => !passengerSchema.safeParse(p).success))
        )
          throw new Error("Complete every passenger's name, age, gender and berth preference.");
        const pnr =
          listing.category === "train"
            ? String(crypto.getRandomValues(new Uint32Array(1))[0]!).padStart(10, "0")
            : undefined;
        const orderId = crypto.randomUUID();
        const issued = priceSeats(listing, seats, travelClass).items.map(
          ({ seat, price }, i): TicketData => ({
            ...listing,
            id: `purchase-${orderId}-${i + 1}`,
            listingId: listing.id,
            serial: `HAY-${orderId.slice(0, 8).toUpperCase()}-${i + 1}`,
            seat,
            price,
            travelClass,
            pnr,
            passengers: passengers[i] ? [passengers[i]!] : undefined,
            status: "upcoming",
          }),
        );
        const selectedByListing = { ...s.selectedByListing },
          holds = { ...s.holds };
        delete selectedByListing[listing.id];
        delete holds[listing.id];
        set({ purchasedTickets: [...issued, ...s.purchasedTickets], selectedByListing, holds });
        return issued;
      },
    }),
    {
      name: "hay-pocket",
      version: 2,
      skipHydration: true,
      migrate: (old, version) => {
        if (version === 1) {
          const previous = old as Partial<Store>;
          return {
            ...previous,
            classByListing: {},
            purchasedTickets: (previous.purchasedTickets ?? []).map((t) => ({
              ...t,
              serial: t.serial.replace(/^HY-/, "HAY-"),
            })),
          };
        }
        const theme = (old as { theme?: Theme })?.theme;
        return {
          theme: theme === "light" || theme === "dark" ? theme : "system",
          selectedByListing: {},
          holds: {},
          purchasedTickets: [],
        };
      },
    },
  ),
);
