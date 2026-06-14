import { z } from "zod";

export const createResourceBodySchema = z.object({
    name: z
        .string({required_error: "name is required and must be a non-empty string"})
        .transform((s) => s.trim())
        .refine((s) => s.length > 0, "name is required and must be a non-empty string"),
    type: z.string().uuid().optional(),
    description: z.string().nullable().optional(),
    status: z.string().optional()
})

export const updateResourceBodySchema = z.object({
    name: z.string().min(1).transform((s) => s.trim()).optional(),
    type: z.string().uuid().optional(),
    description: z.string().nullable().optional(),
    status: z.string().optional(),
    isDeleted: z.boolean().optional()
})

export const resourceIdParamsSchema = z.object({
    id: z.string().uuid("Invalid resource id"),
});

export type CreateResourceBody = z.infer<typeof createResourceBodySchema>;
export type UpdateResourceBody = z.infer<typeof updateResourceBodySchema>;
export type ResourceIdparams = z.infer<typeof resourceIdParamsSchema>;