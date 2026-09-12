import type { Request, Response } from "express";
import { createServiceType, getServiceTypeById, listServiceTypes } from "./service-type.service.js";
import { ApiError } from "../../utils/ApiError.js";



export async function createServiceTypeHandler(req: Request, res: Response) {
    const serviceType = await createServiceType(req.body);
    res.status(201).json({
        success: true,
        serviceType
    })
};


export async function listServiceTypesHandler(req: Request, res: Response) {
    const serviceTypes = await listServiceTypes();
    res.json({
        success: true,
        serviceTypes
    })
}


export async function getServiceTypeHandler(req: Request, res: Response) {
    const { id } = req.params;
    if (typeof id !== "string") throw new ApiError(400, "Service type id is required");

    const serviceType = await getServiceTypeById(id);
    res.json({
        success: true,
        serviceType
    })
}