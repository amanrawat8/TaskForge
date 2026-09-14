import type { Request, Response } from "express";
import { getDashboard } from "./dashboard.service.js";

export async function getDashboardHandler(req: Request, res: Response) {
  const dashboard = await getDashboard(req.user!);
  res.json({ success: true, dashboard });
}
