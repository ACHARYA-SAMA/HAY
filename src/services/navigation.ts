import { z } from 'zod';
import { categories,type Category } from './types';
export const sectionPaths={movie:'/movies',event:'/events',sport:'/sports',bus:'/bus',train:'/trains',flight:'/flights'} as const;
export const detailPaths={movie:'/movies/$id',event:'/events/$id',sport:'/sports/$id',bus:'/bus/$id',train:'/trains/$id',flight:'/flights/$id'} as const;
export const sectionNames:Record<Category,string>={movie:'Movies',event:'Events',sport:'Sports',bus:'Bus',train:'Trains',flight:'Flights'};
const text=z.string().trim().max(200).optional().catch(undefined);
const schema=z.object({cat:z.enum(categories).optional().catch(undefined),city:text,from:text,to:text,date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined),q:text,venue:text,time:text,language:text,format:text,genre:text,sport:text,sort:text,ac:text,seatType:text,window:text,boarding:text,travelClass:text,quota:text,stops:text,operator:text,cabin:text,maxPrice:z.coerce.number().min(0).max(50000).optional().catch(undefined),passengers:z.coerce.number().int().min(1).max(6).optional().catch(undefined),expired:z.coerce.boolean().optional().catch(undefined)});
export type CatalogSearch=z.infer<typeof schema>;
export const parseCatalogSearch=(value:Record<string,unknown>)=>schema.parse(value);
