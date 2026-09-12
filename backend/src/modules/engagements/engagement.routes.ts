import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { createEngagementSchema } from "./engagement.schema.js";
import { createEngagementHandler, getEngagementHandler, listEngagementsHandler } from "./engagement.controller.js";



export const engagementRouter = Router();

engagementRouter.use(requireAuth);

engagementRouter.post("/", requireRole("ADMIN", "MANAGER"), validate(createEngagementSchema), createEngagementHandler);

engagementRouter.get("/", requireRole("ADMIN", "MANAGER"), listEngagementsHandler);

engagementRouter.get("/:id", requireRole("ADMIN", "MANAGER"), getEngagementHandler);