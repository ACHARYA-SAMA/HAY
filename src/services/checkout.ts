import { z } from "zod";

import type { Listing, Passenger } from "./types";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
});

export type Contact = z.infer<typeof contactSchema>;

export const passengerSchema = z.object({
  name: z.string().trim().min(2, "Enter passenger name."),
  age: z.number().int().min(1).max(120),
  gender: z.enum(["Female", "Male", "Non-binary", "Prefer not to say"]),
  berthPreference: z.enum(["Any", "LB", "MB", "UB", "SL", "SU"]),
});

export type BookingOptions = { passengers?: Passenger[] };

export const berthLabel = (seat: string) =>
  `${seat} · ${["LB", "MB", "UB", "SL", "SU"][(Number(seat.slice(1)) - 1) % 5]}`;

export const HOLD_DURATION = 10 * 60 * 1000;

export function isInventorySeatTaken(seat: string) {
  if (!/^[A-H][1-8]$/.test(seat)) return true;

  return (seat.charCodeAt(0) - 65 + Number(seat.slice(1)) - 1) % 9 === 0;
}

/** The seat map, receipt and issued tickets all use these exact line prices. */

export function priceSeats(
  listing: Pick<Listing, "price" | "category" | "fares">,
  seats: readonly string[],
  travelClass?: string,
) {
  const fare = listing.fares?.find((f) => f.code === travelClass)?.price ?? listing.price;

  const items = [...new Set(seats)].map((seat) => {
    if (!/^[A-H][1-8]$/.test(seat)) throw new Error("Invalid seat.");

    const price =
      listing.category === "movie" && /^[A-C]/.test(seat) ? Math.round(listing.price * 0.75) : fare;

    return { seat, price };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price, 0),
    fee = items.length ? 79 : 0;

  return { items, subtotal, fee, total: subtotal + fee };
}
