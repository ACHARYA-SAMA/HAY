import { beforeEach, describe, expect, it } from 'vitest';
import { priceSeats, contactSchema } from '@/services/checkout';
import { useAppStore } from '@/stores/app-store';
import type { Listing } from '@/services/types';
const movie:Listing={id:'film',category:'movie',title:'Test film',venue:'Cinema',city:'Hyderabad',date:'2026-10-07T00:00:00+05:30',time:'19:20',price:320,tag:'DOLBY'};
beforeEach(()=>useAppStore.setState({selectedByListing:{},holds:{},purchasedTickets:[]}));
describe('checkout integrity',()=>{
 it('prices mixed cinema rows once for map and receipt',()=>{const p=priceSeats(movie,['A2','F7']);expect(p.items.map(i=>i.price)).toEqual([240,320]);expect(p.subtotal).toBe(560);expect(p.fee).toBe(79);expect(p.total).toBe(639)});
 it('uses listing prices for non-cinema tickets and no fee for no seats',()=>{expect(priceSeats({...movie,category:'train',price:1840},['A2']).total).toBe(1919);expect(priceSeats(movie,[]).total).toBe(0)});
 it('rejects whitespace names and malformed emails',()=>{expect(contactSchema.safeParse({name:'  ',email:'a@b.com'}).success).toBe(false);expect(contactSchema.safeParse({name:'Asha',email:'bad@'}).success).toBe(false);expect(contactSchema.parse({name:'  Asha Reddy ',email:' asha@example.com '}).name).toBe('Asha Reddy')});
 it('isolates seats and releases only the expired listing',()=>{const s=useAppStore.getState();s.toggleSeat('film','A2');s.toggleSeat('train','B2');s.startHold('film',1000);s.release('film');expect(useAppStore.getState().selectedByListing).toEqual({train:['B2']});expect(useAppStore.getState().holds['film']).toBeUndefined()});
 it('creates one wallet ticket per seat and prevents a second payment',()=>{const s=useAppStore.getState();s.toggleSeat('film','A2');s.toggleSeat('film','F7');s.startHold('film',1000);const tickets=s.purchase(movie,{name:'Asha',email:'asha@example.com'},2000);expect(tickets.map(t=>t.price)).toEqual([240,320]);expect(new Set(tickets.map(t=>t.id)).size).toBe(2);expect(useAppStore.getState().purchasedTickets).toHaveLength(2);expect(useAppStore.getState().selectedByListing['film']).toBeUndefined();expect(()=>s.purchase(movie,{name:'Asha',email:'asha@example.com'},2000)).toThrow()});
 it('rejects payment at the exact expiry and releases seats',()=>{const s=useAppStore.getState();s.toggleSeat('film','A2');s.startHold('film',1000);expect(()=>s.purchase(movie,{name:'Asha',email:'asha@example.com'},601000)).toThrow('expired');expect(useAppStore.getState().purchasedTickets).toHaveLength(0);expect(useAppStore.getState().selectedByListing['film']).toBeUndefined()});
});