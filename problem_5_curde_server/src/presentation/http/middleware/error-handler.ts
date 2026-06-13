import { logger } from "@infrastructure/logging/logger";
import { resError } from "@presentation/http/utils/response";
import { NextFunction, Request, Response } from "express";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void{
    logger.error(err.message, {stack: err.stack});
    if(!res.headersSent){
        resError(res, "Internal server error");
    }
}