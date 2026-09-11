import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { createClientSchema } from "./client.schema.js";
import { createClientHandler, listClientsHandler } from "./client.controller.js";



export const clientRouter = Router();


clientRouter.use(requireAuth);
clientRouter.post("/", requireRole("ADMIN"), validate(createClientSchema), createClientHandler);
clientRouter.get("/", requireRole("ADMIN", "MANAGER"), listClientsHandler);