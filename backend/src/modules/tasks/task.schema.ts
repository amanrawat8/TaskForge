import {z} from "zod";


export const updateStatusSchema = z.object({
    status: z.enum(["NOT_STARTED", "IN_PROGRESS", "READY_FOR_REVIEW", "CHANGES_REQUESTED", "WAITING_FOR_CLIENT", "COMPLETED"]),
    note: z.string().optional(), 
});


export const updateAssignmentSchema = z.object({
    assignedToId: z.string().uuid().optional(),
    dueDate: z.coerce.date().optional(),
})
    .refine((data) => data.assignedToId !== undefined || data.dueDate !== undefined, {
        message: "Provide atleast one of assignedToId or dueDate",
    });

    
