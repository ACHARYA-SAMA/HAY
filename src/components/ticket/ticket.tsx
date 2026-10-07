import type { TicketData } from "@/services/types";
import { money, shortDate } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export function Ticket({ticket,compact=false}:{ticket:TicketData;compact?:boolean}){
 return <article className={`ticket ticket-${ticket.category} paper-grain ${compact?"ticket-compact":""}`}>
  <div className="ticket-body"><div className="flex items-start justify-between gap-3"><span className="category-tag">{ticket.category}</span><span className="font-mono text-xs font-bold">{ticket.tag}</span></div>
   <h3 className="mt-5 text-2xl font-black uppercase leading-none md:text-4xl">{ticket.title}</h3>
   <p className="mt-3 font-bold">{ticket.from && ticket.to ? `${ticket.from} → ${ticket.to}` : ticket.venue}</p>
   <p className="mt-3 font-mono text-xs font-bold">SEAT {ticket.seat}</p><div className="mt-5 grid grid-cols-3 gap-2 border-t-[3px] border-dashed border-ink pt-3 font-mono text-xs font-bold"><span>{shortDate(ticket.date)}</span><span>{ticket.time}</span><span>{money.format(ticket.price)}</span></div>
  </div>
  <div className="ticket-stub"><span className="barcode"/><span className="font-mono text-[10px] font-bold">{ticket.serial}</span>{!compact&&<Link to="/ticket/$id" params={{id:ticket.id}} className={`clicky clicky--sm clicky--${ticket.category} ticket-open`}>OPEN</Link>}</div>
 </article>
}