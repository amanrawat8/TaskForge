import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";




type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "CHANGES_REQUESTED" | "WAITING_FOR_CLIENT" | "COMPLETED";
type Role = "ADMIN" | "MANAGER" | "TEAM_MEMBER";
type Actor = { sub: string; role: Role };

const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    NOT_STARTED: ["IN_PROGRESS"],
    IN_PROGRESS: ["READY_FOR_REVIEW", "WAITING_FOR_CLIENT"],
    WAITING_FOR_CLIENT: ["IN_PROGRESS"],
    READY_FOR_REVIEW: ["COMPLETED", "CHANGES_REQUESTED"],
    CHANGES_REQUESTED: ["IN_PROGRESS"],
    COMPLETED: [],
};


const REVIEW_TRANSITIONS = new Set<TaskStatus>(["COMPLETED", "CHANGES_REQUESTED"]);

export async function updateTaskStatus(actor: Actor, taskId: string, toStatus: TaskStatus, note?: string) {
    const task = await prisma.task.findUnique({
        where: { id: taskId }
    });

    if(!task) throw new ApiError(404, "task not found");

    const allowedNext = TRANSITIONS[task.status as TaskStatus];
    if(!allowedNext.includes(toStatus)) {
        throw new ApiError(400, `Cannot transition from ${task.status} to ${toStatus}`);
    }


    const isReviewAction = REVIEW_TRANSITIONS.has(toStatus);

    if(isReviewAction) {
        if(actor.role === "TEAM_MEMBER") {
            throw new ApiError(403, "Only a manager can approve or request changes");
        }

        if(task.assignedToId === actor.sub) {
            throw new ApiError(403, "You cannot review your own work");
        }
    } else {
        const isAssignee = task.assignedToId === actor.sub;
        const isManagerOrAdmin = actor.role === "MANAGER" || actor.role === "ADMIN";

        if(!isAssignee && !isManagerOrAdmin) {
            throw new ApiError(403, "You can only update your own tasks");
        }
    }


    return prisma.$transaction(async (tx) => {
        const updated = await tx.task.update({
            where: {id: taskId },
            data: {
                status: toStatus,
                ...(isReviewAction ? { reviewedById: actor.sub } : {}), 
            }, 
        });

        await tx.taskHistory.create({
            data: {
                taskId,
                fromStatus: task.status,
                toStatus,
                changedById: actor.sub,
                ...(note ? { note } : {}),
            },
        });

        return updated;
    })
}


export async function updateTaskAssignment(taskId: string, data: { assignedToId?: string; dueDate?: Date }) {
    const task = await prisma.task.findUnique({ where: { id: taskId }});
    if(!task) throw new ApiError(404, "Task not found");

    if(data.assignedToId) {
        const user = await prisma.user.findUnique({
            where: { id: data.assignedToId }
        });

        if(!user) throw new ApiError(404, "Assignee not found");

    }

    return prisma.task.update({
        where: {id: taskId },
        data: {
            ...(data.assignedToId ? {assignedToId: data.assignedToId} : {}),
            ...(data.dueDate ? { dueDate: data.dueDate} : {}),
        },
    });
}


export async function listTasks(actor:Actor, filters: { status?: TaskStatus; assignedToId?: string}) {
    const where: Record<string, unknown> = {};

    if(actor.role === "TEAM_MEMBER") {
        where.assignedToId = actor.sub;  // server-side enforced, ignores any client-supplied filter
    } else if(filters.assignedToId) {
        where.assignedToId = filters.assignedToId;
    }

    if(filters.status) where.status = filters.status;

    return prisma.task.findMany({
        where,
        include: {engagement: { include: { client: true, serviceType: true } }, assignedTo: true, reviewedBy: true },
        orderBy: { dueDate: "asc"},
    });

}


export async function getTaskById(actor: Actor, taskId: string) {
    const task = await prisma.task.findUnique({
        where: {id: taskId},
        include: { engagement: {include: { client: true, serviceType: true } }, assignedTo: true, reviewedBy: true, history: true },

    });

    if(!task) throw new ApiError(404, "Task not found");

    if(actor.role === "TEAM_MEMBER" && task.assignedToId !== actor.sub) {
        throw new ApiError(403, "You can only view you own tasks");
    }

    return task;
}