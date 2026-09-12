import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { isUniqueConstraintError } from "../../utils/prismaErrors.js";




type TaskTemplateInput = {
    title: string
    order: number
    defaultDueOffsetDays: number
};

type createServiceTypeInput = {
    name: string
    isRecurring: boolean
    recurrenceUnit?: "MONTHLY" | "QUARTERLY" | "YEARLY"
    taskTemplates: TaskTemplateInput[];
};


export async function createServiceType(data: createServiceTypeInput) {
    try{
        return await prisma.serviceType.create({
            data: {
                name: data.name,
                isRecurring: data.isRecurring,
                ...(data.recurrenceUnit ? {recurrenceUnit: data.recurrenceUnit } : {}),
                taskTemplates: {create: data.taskTemplates },
            },
            include: {taskTemplates: {orderBy: {order: "asc"}}},
        });
    } catch (err) {
        if (isUniqueConstraintError(err)) throw new ApiError(409, "Service type name already in use");
        throw err;
    }
};



export async function listServiceTypes() {
    return prisma.serviceType.findMany({
        include: {taskTemplates: {orderBy: {order: "asc"}}},
        orderBy: {name: "asc"},
    });
}


export async function getServiceTypeById(id: string){
    const serviceType = await prisma.serviceType.findUnique({
        where: {id},
        include: {taskTemplates: {orderBy: {order: "asc" } } },
    });

    if(!serviceType){
        throw new ApiError(404, "Service type not found");
    }

    return serviceType;
}