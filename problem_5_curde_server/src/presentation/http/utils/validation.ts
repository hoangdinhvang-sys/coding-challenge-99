import { z } from "zod";
import { Request, Response } from "express";
import { resValidationError } from "./response";

export function validateQuery<T>(
    schema: z.ZodType<T>,
    req: Request,
    res: Response
): T | undefined{
    const result = schema.safeParse(req.query);
    if(result.success) return result.data;

    const error = result.error.issues.map((e) => e.message).join("; ") || "Validation failed";
    resValidationError(res, error);

    return undefined;
}

export function validateBody<T>(
    schema: z.ZodType<T>,
    req: Request,
    res: Response
): T | undefined{
    const result = schema.safeParse(req.body);
    if(result.success) return result.data;

    const error = result.error.issues.map((e) => e.message).join("; ") || "Validation failed";
    resValidationError(res, error);
    return undefined;
}

export function validateParams<T>(
    schema: z.ZodType<T>,
    req: Request,
    res: Response
): T | undefined{
    const result = schema.safeParse(req.params);

    if(result.success) return result.data;

    const error = result.error.issues.map((e) => e.message).join("; ") || "Validation failed";
    resValidationError(res, error);
    return undefined;
}