import type { Request, Response } from "express";
import { createEngagement, getEngagementById, listEngagements } from "./engagement.service.js";




export async function createEngagementHandler(req: Request, res: Response) {
    const engagement = await createEngagement(req.body);
    res.status(201).json({
        success: true,
        engagement
    })
}


export async function listEngagementsHandler(req: Request, res: Response) {
    const clientId = req.query.clientId as string | undefined;
    const engagements = await listEngagements(clientId ? { clientId } : {});
    res.json({
        success: true,
        engagements
    })
}


export async function getEngagementHandler(req: Request, res: Response) {
    const engagement = await getEngagementById(req.params.id as string);
    res.json({
        success: true,
        engagement
    })
}