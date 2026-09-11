import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";


declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}


export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if(!header?.startsWith("Bearer ")){
        throw new ApiError(401, "Missing or invalid Authorization header");
    }

    try{
        req.user = verifyToken(header.slice(7));
        next();
    } catch {
        throw new ApiError(401, "Invalid or expired token");
    }
}


export function requireRole(...roles: JwtPayload["role"][]){
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user || !roles.includes(req.user.role)){
            throw new ApiError(403, "Insufficient permissions");
        }

        next();
    };
}