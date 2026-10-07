import { describe,it,expect } from 'vitest';
import { filterListings } from '@/services/catalog';
import { getInventory } from '@/services/fixtures';
describe('section filters',()=>{const all=getInventory().listings;
 it('combines route endpoints, class and departure window',()=>{const results=filterListings(all,{cat:'train',from:'Hyderabad',to:'Bengaluru',travelClass:'3A',window:'morning'});expect(results.length).toBeGreaterThan(0);expect(results.every(l=>l.from?.city==='Hyderabad'&&l.to?.city==='Bengaluru')).toBe(true)});
 it('supports movie languages and per-venue formats',()=>{expect(filterListings(all,{cat:'movie',language:'Telugu',format:'IMAX'}).length).toBeGreaterThan(0)});
 it('keeps a zero price ceiling instead of ignoring it',()=>{expect(filterListings(all,{maxPrice:0})).toHaveLength(0)});
 it('sorts prices and preserves the input array',()=>{const before=all.map(l=>l.id);const result=filterListings(all,{sort:'price'});expect(result[0]!.price).toBeLessThanOrEqual(result.at(-1)!.price);expect(all.map(l=>l.id)).toEqual(before)});
});
