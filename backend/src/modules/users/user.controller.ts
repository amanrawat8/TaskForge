import type { Request, Response } from "express";
import { createUser, listUsers } from "./user.service.js";


export async function createUserHandler(req: Request, res: Response) {
    const user = await createUser(req.body);
    res.status(201).json({
        success: true,
        user 
    });
}


export async function listUsersHandler(req: Request, res: Response) {
    const role = req.query.role as "ADMIN" | "MANAGER" | "TEAM_MEMBER" | undefined;
    const users = await listUsers(role);
    res.json({
        success: true,
        users
    })
}