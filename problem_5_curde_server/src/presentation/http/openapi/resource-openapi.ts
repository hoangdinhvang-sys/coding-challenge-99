import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createResourceBodySchema, resourceIdParamsSchema, updateResourceBodySchema } from "@presentation/http/v1/schemas/resource.schema";
import { z } from "zod";

export const registerResourcePaths = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: "post",
        path: "/app/v1/resources",
        summary: "Create resource",
        request: {
            body: {
            content: {
                "application/json": {
                schema: createResourceBodySchema,
                },
            },
            },
        },
        responses: {
            201: {
                description: "Resource created",
            },
        },
    });
    
    registry.registerPath({
        method: "get",
        path: "/app/v1/resources",
        summary: "Get list resources",
        request: {
            query: z.object({
            page: z.coerce.number().optional(),
            pSize: z.coerce.number().optional(),
            status: z.string().optional(),
            search: z.string().optional(),
            }),
        },
        responses: {
            200: {
                description: "Success",
            },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/app/v1/resources/{id}",
        summary: "Get resource by id",
        request: {
            params: resourceIdParamsSchema,
        },
        responses: {
            200: {
                description: "Success",
            },
            404: {
                description: "Resource not found",
            },
        },
    });

    registry.registerPath({
        method: "put",
        path: "/app/v1/resources/{id}",
        summary: "Update resource",
        request: {
            params: resourceIdParamsSchema,
            body: {
                content: {
                    "application/json": {
                        schema: updateResourceBodySchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Resource updated",
            },
            404: {
                description: "Resource not found",
            },
        },
    });

    registry.registerPath({
        method: "delete",
        path: "/app/v1/resources/{id}",
        summary: "Delete resource",
        request: {
            params: resourceIdParamsSchema,
        },
        responses: {
            204: {
                description: "No content",
            },
            404: {
                description: "Resource not found",
            },
        },
    });
};