import {z} from "zod";

export const createEngagementSchema = z.object({
    clientId: z.uuid(),
    serviceTypeId: z.uuid(),
    periodStart: z.coerce.date(), 
});

