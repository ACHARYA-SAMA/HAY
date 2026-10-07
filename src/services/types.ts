import { z } from "zod";

export const categories = ["movie", "event", "sport", "bus", "train", "flight"] as const;
export type Category = (typeof categories)[number];

export const listingSchema = z.object({
  id: z.string(), category: z.enum(categories), title: z.string(), venue: z.string(), city: z.string(),
  date: z.string(), time: z.string(), price: z.number(), tag: z.string(), from: z.string().optional(), to: z.string().optional(),
});
export type Listing = z.infer<typeof listingSchema>;
export type TicketData = Listing & { listingId?: string; serial: string; seat: string; status: "upcoming" | "past" };