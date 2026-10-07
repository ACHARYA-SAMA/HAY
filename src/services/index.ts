import { notFound } from "@tanstack/react-router";
import { listingSchema, type Category } from "./types";
import { getInventory } from "./fixtures";
const wait=()=>new Promise(r=>setTimeout(r,350));
export async function listListings(){await wait();return listingSchema.array().parse(getInventory().listings)}
export async function getListing(id:string,category?:Category){await wait();const item=getInventory().listings.find(x=>x.id===id&&(!category||x.category===category));if(!item)throw notFound();return listingSchema.parse(item)}
export async function listTickets(){await wait();return getInventory().tickets}
export async function getTicket(id:string){await wait();const ticket=getInventory().tickets.find(t=>t.id===id);if(!ticket)throw notFound();return ticket}
export function isLocalTicketId(id:string){return /^purchase-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[1-9][0-9]*$/i.test(id)}

export async function getCatalog(){await wait();return getInventory()}
