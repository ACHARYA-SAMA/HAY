import { z } from "zod";
export const categories = ["movie", "event", "sport", "bus", "train", "flight"] as const;
export type Category = (typeof categories)[number];
export const endpointSchema = z.object({
  city: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
});
export const fareSchema = z.object({
  code: z.string(),
  label: z.string(),
  price: z.number().positive(),
  availability: z.string(),
  seats: z.number().int().nonnegative(),
});
export const listingSchema = z
  .object({
    id: z.string(),
    category: z.enum(categories),
    title: z.string(),
    venue: z.string(),
    city: z.string(),
    date: z.string(),
    time: z.string(),
    price: z.number().positive(),
    tag: z.string(),
    language: z.string().optional(),
    format: z.string().optional(),
    genre: z.string().optional(),
    sport: z.string().optional(),
    showings: z
      .array(
        z.object({
          venue: z.string(),
          language: z.string(),
          format: z.string(),
          times: z.array(z.string()),
        }),
      )
      .optional(),
    from: endpointSchema.optional(),
    to: endpointSchema.optional(),
    departsAt: z.string().datetime().optional(),
    arrivesAt: z.string().datetime().optional(),
    duration: z.number().positive().optional(),
    operator: z.string().optional(),
    fares: z.array(fareSchema).optional(),
    classes: z.array(z.string()).optional(),
    seatTypes: z.array(z.string()).optional(),
    quotas: z.array(z.string()).optional(),
    ac: z.boolean().optional(),
    stops: z.number().int().nonnegative().optional(),
    boardingPoint: z.string().optional(),
    platform: z.string().optional(),
    gate: z.string().optional(),
  })
  .superRefine((l, ctx) => {
    if (["bus", "train", "flight"].includes(l.category)) {
      for (const field of [
        "from",
        "to",
        "departsAt",
        "arrivesAt",
        "duration",
        "operator",
        "fares",
        "classes",
        "seatTypes",
      ] as const)
        if (l[field] === undefined || (Array.isArray(l[field]) && !l[field]!.length))
          ctx.addIssue({ code: "custom", path: [field], message: "Required for travel" });
      if (l.departsAt && l.arrivesAt && Date.parse(l.arrivesAt) <= Date.parse(l.departsAt))
        ctx.addIssue({
          code: "custom",
          path: ["arrivesAt"],
          message: "Arrival must follow departure",
        });
    }
  });
export type Listing = z.infer<typeof listingSchema>;
export type Passenger = { name: string; age: number; gender: string; berthPreference: string };
export type TicketData = Listing & {
  listingId?: string;
  serial: string;
  seat: string;
  status: "upcoming" | "past";
  travelClass?: string | undefined;
  passengers?: Passenger[] | undefined;
  pnr?: string | undefined;
};
