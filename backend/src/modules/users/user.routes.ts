import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { createUserSchema } from "./user.schema.js";
import { createUserHandler, listUsersHandler } from "./user.controller.js";




export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.post("/", requireRole("ADMIN"), validate(createUserSchema), createUserHandler);
userRouter.get("/", requireRole("ADMIN", "MANAGER"), listUsersHandler);

