import { fixtureDate } from "./fixture-dates";
import type { Listing, TicketData } from "./types";

export function getInventory(today=new Date()){
const day=(offset:number)=>fixtureDate(offset,today);
const listings: Listing[] = [
  { id:"afterlight", category:"movie", title:"Afterlight 77", venue:"Prasads Multiplex", city:"Hyderabad", date:day(0), time:"7:20 PM", price:320, tag:"DOLBY" },
  { id:"monsoon-radio", category:"movie", title:"Monsoon Radio", venue:"AMB Cinemas", city:"Hyderabad", date:day(0), time:"9:40 PM", price:280, tag:"SCREEN 4" },
  { id:"static-hearts", category:"event", title:"Static Hearts Live", venue:"HITEX Hall 4", city:"Hyderabad", date:day(1), time:"8:00 PM", price:1499, tag:"LIVE" },
  { id:"neon-circus", category:"event", title:"Neon Circus", venue:"Odeum Grounds", city:"Pune", date:day(4), time:"6:30 PM", price:899, tag:"OPEN AIR" },
  { id:"hyd-viz", category:"sport", title:"Hyderabad v Vizag", venue:"Deccan Arena", city:"Hyderabad", date:day(2), time:"7:30 PM", price:650, tag:"T20" },
  { id:"city-derby", category:"sport", title:"City Derby 04", venue:"Coastal Stadium", city:"Chennai", date:day(5), time:"6:00 PM", price:520, tag:"LEAGUE" },
  { id:"nightliner", category:"bus", title:"Nightliner 22", venue:"MGBS Bay 18", city:"Hyderabad", from:"Hyderabad", to:"Bengaluru", date:day(0), time:"22:15", price:1190, tag:"SLEEPER" },
  { id:"coast-rail", category:"train", title:"Coast Express", venue:"Secunderabad Jn (SC)", city:"Hyderabad", from:"Secunderabad", to:"Visakhapatnam", date:day(1), time:"06:10", price:1840, tag:"3A · AVL 042" },
  { id:"sky-601", category:"flight", title:"Aero South 601", venue:"Rajiv Gandhi Intl (HYD)", city:"Hyderabad", from:"HYD", to:"BOM", date:day(2), time:"14:35", price:5840, tag:"NONSTOP" },
];
const tickets: TicketData[] = listings.slice(0,4).map((l,i)=>({...l,date:i===3?day(-4):l.date,serial:`HY-${String(42810+i).padStart(6,"0")}`,seat:["F7","GA-2","B-14","U12"][i] ?? "GA",status:i===3?"past":"upcoming"}));
return {listings,tickets};
}
