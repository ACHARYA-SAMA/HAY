export const FIXTURE_TIME_ZONE="Asia/Kolkata";
const indiaDay=new Intl.DateTimeFormat("en-CA",{timeZone:FIXTURE_TIME_ZONE,year:"numeric",month:"2-digit",day:"2-digit"});
/** Kolkata has a fixed +05:30 offset. Anchor at midnight before adding whole days. */
export function fixtureDate(offset:number,now=new Date()){
 const parts=indiaDay.formatToParts(now),part=(name:string)=>Number(parts.find(p=>p.type===name)?.value);
 const midnight=Date.UTC(part("year"),part("month")-1,part("day"))-330*60*1000;
 return new Date(midnight+offset*24*60*60*1000).toISOString();
}
