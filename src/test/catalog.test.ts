import { describe,expect,it } from 'vitest';
import { getInventory } from '@/services/fixtures';
import { filterListings } from '@/services/catalog';
import { categories,listingSchema } from '@/services/types';
describe('expanded searchable catalog',()=>{
 const inventory=getInventory(new Date('2026-10-07T06:00Z')).listings;
 it('has exact category counts',()=>{expect(categories.map(c=>inventory.filter(l=>l.category===c).length)).toEqual([10,8,6,15,12,12])});
 it.each(categories)('%s has at least six default results',cat=>{expect(filterListings(inventory,{cat,city:'Hyderabad'}).length).toBeGreaterThanOrEqual(6)});
 it('gives all travel listings complete origin and destination data',()=>{for(const l of inventory.filter(l=>['bus','train','flight'].includes(l.category))){expect(l.from).toMatchObject({city:expect.any(String),code:expect.any(String),name:expect.any(String)});expect(l.to).toMatchObject({city:expect.any(String),code:expect.any(String),name:expect.any(String)});expect(listingSchema.safeParse(l).success).toBe(true);expect(new Date(l.arrivesAt!).getTime()).toBeGreaterThan(new Date(l.departsAt!).getTime())}});
 it('filters travel by origin rather than destination or venue city',()=>{const travel=inventory.filter(l=>l.category==='train');const item=travel[0]!;expect(filterListings(travel,{city:item.from!.city})).toContain(item);expect(filterListings(travel,{city:item.to!.city})).not.toContain(item)});
 it('provides three venues with 3–5 showtimes per movie',()=>{for(const l of inventory.filter(l=>l.category==='movie')){expect(l.showings).toHaveLength(3);for(const s of l.showings!){expect(s.times.length).toBeGreaterThanOrEqual(3);expect(s.times.length).toBeLessThanOrEqual(5)}}});
});
