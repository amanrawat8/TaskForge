import type { Request, Response, NextFunction } from "express";
import { createClient, listClients } from "./client.service.js";



export async function createClientHandler(req: Request, res: Response) {
    const client = await createClient(req.body.name);

    res.status(201).json({
        success: true,
        client
    })
};



export async function listClientsHandler(req: Request, res: Response) {
    const clients = await listClients();

    res.json({
        success: true,
        clients 
    })
};

