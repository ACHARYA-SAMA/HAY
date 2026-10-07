import { z } from "zod";
import type { Listing } from "./types";
export const contactSchema = z.object({name:z.string().trim().min(2,"Enter your full name."),email:z.string().trim().email("Enter a valid email address.")});
export type Contact = z.infer<typeof contactSchema>;
export const HOLD_DURATION = 10 * 60 * 1000;
export function isInventorySeatTaken(seat:string) {
  if(!/^[A-H][1-8]$/.test(seat)) return true;
  return (seat.charCodeAt(0)-65+Number(seat.slice(1))-1)%9===0;
}
/** The seat map, receipt and issued tickets all use these exact line prices. */
export function priceSeats(listing:Pick<Listing,"price"|"category">, seats:readonly string[]) {
  const items=[...new Set(seats)].map(seat=>{
    if(!/^[A-H][1-8]$/.test(seat)) throw new Error("Invalid seat.");
    const price=listing.category==="movie"&&/^[A-C]/.test(seat)?Math.round(listing.price*.75):listing.price;
    return {seat,price};
  });
  const subtotal=items.reduce((sum,item)=>sum+item.price,0),fee=items.length?79:0;
  return {items,subtotal,fee,total:subtotal+fee};
}
