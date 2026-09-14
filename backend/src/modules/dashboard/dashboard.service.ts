import { prisma } from "../../config/prisma.js";

type Role = "ADMIN" | "MANAGER" | "TEAM_MEMBER";
type Actor = { sub: string; role: Role };

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function endOfTodayUTC(): Date {
  return new Date(startOfTodayUTC().getTime() + 24 * 60 * 60 * 1000 - 1);
}

export async function getDashboard(actor: Actor) {
  const scope = actor.role === "TEAM_MEMBER" ? { assignedToId: actor.sub } : {};
  const todayStart = startOfTodayUTC();
  const todayEnd = endOfTodayUTC();

  const [openTasks, overdueTasks, dueTodayTasks, waitingForClientTasks, waitingForReviewTasks] = await Promise.all([
    prisma.task.count({ where: { ...scope, status: { not: "COMPLETED" } } }),
    prisma.task.count({ where: { ...scope, status: { not: "COMPLETED" }, dueDate: { lt: todayStart } } }),
    prisma.task.count({ where: { ...scope, status: { not: "COMPLETED" }, dueDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.task.count({ where: { ...scope, status: "WAITING_FOR_CLIENT" } }),
    prisma.task.count({ where: { ...scope, status: "READY_FOR_REVIEW" } }),
  ]);

  return { openTasks, overdueTasks, dueTodayTasks, waitingForClientTasks, waitingForReviewTasks };
}
