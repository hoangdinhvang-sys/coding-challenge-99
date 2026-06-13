import { logger } from "@infrastructure/logging/logger";
import { Request, Response, NextFunction } from "express";

export function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction
):void{
    const start = Date.now();

    res.on("finish", () =>{
        const duration = Date.now() - start;
        logger.info("request", {
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: req.statusCode,
            durationMs: duration,
            userAgent: req.get("user-agent") ?? "-"
        })
    });

    next();
}