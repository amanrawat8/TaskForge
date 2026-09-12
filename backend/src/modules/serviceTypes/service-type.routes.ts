import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { createServiceTypeSchema } from "./service-type.schema.js";
import { createServiceTypeHandler, getServiceTypeHandler, listServiceTypesHandler } from "./service-type.controller.js";




export const serviceTypeRouter = Router();


serviceTypeRouter.use(requireAuth);

serviceTypeRouter.post("/", requireRole("ADMIN"), validate(createServiceTypeSchema), createServiceTypeHandler);
serviceTypeRouter.get("/", requireRole("ADMIN", "MANAGER"), listServiceTypesHandler);
serviceTypeRouter.get("/:id", requireRole("ADMIN", "MANAGER"), getServiceTypeHandler)