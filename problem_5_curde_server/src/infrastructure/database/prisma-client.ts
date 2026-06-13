import { PrismaClient } from "@prisma/client";

const prismaClient = globalThis as unknown as {prisma: PrismaClient | undefined}

export const prisma = prismaClient.prisma ??
new PrismaClient({
    log:process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

if(process.env.NODE_ENV != "production"){
    prismaClient.prisma = prisma;
}