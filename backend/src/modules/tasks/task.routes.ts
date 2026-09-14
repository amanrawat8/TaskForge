import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { updateStatusSchema, updateAssignmentSchema } from "./task.schema.js";
import {
  updateTaskStatusHandler,
  updateTaskAssignmentHandler,
  listTasksHandler,
  getTaskHandler,
} from "./task.controller.js";

export const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.get("/", listTasksHandler);
taskRouter.get("/:id", getTaskHandler);
taskRouter.patch("/:id/status", validate(updateStatusSchema), updateTaskStatusHandler);
taskRouter.patch("/:id", requireRole("ADMIN", "MANAGER"), validate(updateAssignmentSchema), updateTaskAssignmentHandler);
