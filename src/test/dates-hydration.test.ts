import { afterEach,describe,expect,it,vi } from 'vitest';
import { fixtureDate } from '@/services/fixture-dates';
import { getInventory } from '@/services/fixtures';
import { shortDate } from '@/lib/format';
afterEach(()=>{localStorage.clear();vi.resetModules()});
describe('stable India dates and hydration',()=>{
 it('anchors dates to Kolkata midnight plus fixed day offsets',()=>{const now=new Date('2026-10-06T20:00:00Z');expect(fixtureDate(0,now)).toBe('2026-10-06T18:30:00.000Z');expect(fixtureDate(2,now)).toBe('2026-10-08T18:30:00.000Z');expect(fixtureDate(-1,now)).toBe('2026-10-05T18:30:00.000Z')});
 it('is identical at different times within the same India day',()=>{expect(fixtureDate(1,new Date('2026-10-06T19:00Z'))).toBe(fixtureDate(1,new Date('2026-10-07T15:00Z')))});
 it('refreshes fixture inventory across India midnight without restarting',()=>{expect(getInventory(new Date('2026-10-06T18:29Z')).listings[0]?.date).toBe('2026-10-05T18:30:00.000Z');expect(getInventory(new Date('2026-10-06T18:31Z')).listings[0]?.date).toBe('2026-10-06T18:30:00.000Z')});
 it('formats the India calendar day at a UTC date boundary',()=>{expect(shortDate('2026-10-06T20:00:00Z')).toContain('7 Oct')});
 it('leaves the initial state clean until explicit hydration',async()=>{vi.resetModules();localStorage.setItem('hay-pocket',JSON.stringify({version:1,state:{theme:'dark',selectedByListing:{afterlight:['A2']},holds:{},purchasedTickets:[]}}));const {useAppStore}=await import('@/stores/app-store');expect(useAppStore.getState().theme).toBe('system');expect(useAppStore.getState().selectedByListing).toEqual({});await useAppStore.persist.rehydrate();expect(useAppStore.getState().theme).toBe('dark');expect(useAppStore.getState().selectedByListing['afterlight']).toEqual(['A2'])});
});