import type { Request, Response } from "express";
import { updateTaskStatus, updateTaskAssignment, listTasks, getTaskById } from "./task.service.js";

export async function updateTaskStatusHandler(req: Request, res: Response) {
  const { status, note } = req.body;
  const task = await updateTaskStatus(req.user!, req.params.id as string, status, note);
  res.json({ success: true, task });
}

export async function updateTaskAssignmentHandler(req: Request, res: Response) {
  const task = await updateTaskAssignment(req.params.id as string, req.body);
  res.json({ success: true, task });
}

export async function listTasksHandler(req: Request, res: Response) {
  const status = req.query.status as any;
  const assignedToId = req.query.assignedToId as string | undefined;
  const tasks = await listTasks(req.user!, {
        ...(status ? { status } : {}),
        ...(assignedToId ? { assignedToId } : {}),
    });
  res.json({ success: true, tasks });
}

export async function getTaskHandler(req: Request, res: Response) {
  const task = await getTaskById(req.user!, req.params.id as string);
  res.json({ success: true, task });
}
