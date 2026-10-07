import { create } from "zustand";
import { persist } from "zustand/middleware";
import { contactSchema, HOLD_DURATION, isInventorySeatTaken, priceSeats, type Contact } from "@/services/checkout";
import type { Listing, TicketData } from "@/services/types";
type Theme="system"|"light"|"dark";
type Store={theme:Theme;setTheme:(theme:Theme)=>void;selectedByListing:Record<string,string[]>;holds:Record<string,number>;purchasedTickets:TicketData[];toggleSeat:(listingId:string,seat:string)=>void;startHold:(listingId:string,now?:number)=>void;release:(listingId:string)=>void;purchase:(listing:Listing,contact:Contact,now?:number)=>TicketData[]};
export const EMPTY_SEATS:readonly string[]=[];
export const useAppStore=create<Store>()(persist((set,get)=>({
 theme:"system",setTheme:theme=>set({theme}),selectedByListing:{},holds:{},purchasedTickets:[],
 toggleSeat:(listingId,seat)=>set(s=>{if(s.holds[listingId]||isInventorySeatTaken(seat)||s.purchasedTickets.some(t=>t.listingId===listingId&&t.seat===seat))return s;const seats=s.selectedByListing[listingId]??[];return {selectedByListing:{...s.selectedByListing,[listingId]:seats.includes(seat)?seats.filter(x=>x!==seat):[...seats,seat]}}}),
 startHold:(listingId,now=Date.now())=>set(s=>!s.selectedByListing[listingId]?.length||s.holds[listingId]?s:{holds:{...s.holds,[listingId]:now+HOLD_DURATION}}),
 release:listingId=>set(s=>{const selectedByListing={...s.selectedByListing},holds={...s.holds};delete selectedByListing[listingId];delete holds[listingId];return {selectedByListing,holds}}),
 purchase:(listing,contact,now=Date.now())=>{
   contactSchema.parse(contact);
   const s=get(),expires=s.holds[listing.id];
   if(!expires||expires<=now){s.release(listing.id);throw new Error("Your hold has expired. Choose seats again.")}
   const seats=s.selectedByListing[listing.id]??[];
   if(!seats.length)throw new Error("Choose at least one seat.");
   if(seats.some(seat=>isInventorySeatTaken(seat)||s.purchasedTickets.some(t=>t.listingId===listing.id&&t.seat===seat)))throw new Error("A selected seat is no longer available.");
   const orderId=crypto.randomUUID();
   const issued=priceSeats(listing,seats).items.map(({seat,price},i):TicketData=>({...listing,id:`purchase-${orderId}-${i+1}`,listingId:listing.id,serial:`HY-${orderId.slice(0,8).toUpperCase()}-${i+1}`,seat,price,status:"upcoming"}));
   const selectedByListing={...s.selectedByListing},holds={...s.holds};delete selectedByListing[listing.id];delete holds[listing.id];
   set({purchasedTickets:[...issued,...s.purchasedTickets],selectedByListing,holds});return issued;
 }
}),{name:"hay-pocket",version:1,skipHydration:true,migrate:old=>{const theme=(old as {theme?:Theme})?.theme;return {theme:theme==="light"||theme==="dark"?theme:"system",selectedByListing:{},holds:{},purchasedTickets:[]}}}));
