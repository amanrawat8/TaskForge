import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function validate(schema: ZodType) {

    return (req: Request, res: Response, next: NextFunction) => {

        const result = schema.safeParse(req.body);
        if(!result.success){
            throw new ApiError(400, result.error.issues.map((i) => i.message).join(", "));
        }

        req.body = result.data;
        next();
    };
}

