import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if(err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message 
        })
    }

    console.error(err);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    })
}