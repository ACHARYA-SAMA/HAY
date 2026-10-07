import { describe,expect,it } from 'vitest';
import { getListing,getTicket } from '@/services';
describe('invalid inventory IDs',()=>{
 it('rejects missing listing IDs instead of returning the first fixture',async()=>{await expect(getListing('missing-listing')).rejects.toMatchObject({isNotFound:true})});
 it('rejects a listing on the wrong category route',async()=>{await expect(getListing('nightliner','movie')).rejects.toMatchObject({isNotFound:true})});
 it('rejects missing ticket IDs',async()=>{await expect(getTicket('missing-ticket')).rejects.toMatchObject({isNotFound:true})});
 it('returns an existing ticket',async()=>{expect((await getTicket('afterlight')).id).toBe('afterlight')});
});