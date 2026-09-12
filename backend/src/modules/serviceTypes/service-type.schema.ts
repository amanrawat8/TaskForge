import {z} from "zod";


const taskTemplateInput = z.object({
    title: z.string().min(1),
    order: z.number().int().min(1),
    defaultDueOffsetDays: z.number().int().min(0).optional(),
});


export const createServiceTypeSchema = z.object({
    name: z.string().min(1),
    isRecurring: z.boolean(),
    recurrenceUnit: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
    taskTemplates: z.array(taskTemplateInput).min(1),
})
.superRefine((data, ctx) => {
    if(data.isRecurring && !data.recurrenceUnit){
        ctx.addIssue({
            code: "custom",
            path: ["recurrenceUnit"],
            message: "recurrenceUnit is required when isRecurring is true",
        });
    }


    if(!data.isRecurring && data.recurrenceUnit) {
        ctx.addIssue({
            code: "custom",
            path: ["recurrenceUnit"],
            message: "recurrenceUnit must be omitted when isRecurring is false",
        });
    }
});

