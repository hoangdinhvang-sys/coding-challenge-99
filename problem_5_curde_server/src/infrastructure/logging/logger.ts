import winston from "winston";

const logLevel = process.env.LOG_LEVEL ??
(process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        winston.format.errors({stack: true}),
        winston.format.printf(({level, message, timestamp, stack, ...meta}) => {
            const metaStr = Object.keys(meta).length ? `${JSON.stringify(meta)}`: "";

            return stack 
            ? `${timestamp} [${level}] ${message} ${metaStr}\n${stack}`
            : `${timestamp} [${level}] ${message} ${metaStr}`
        })
    ),
    defaultMeta: {service: "problem5"},
    transports: [new winston.transports.Console()],
})
