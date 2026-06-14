import { ResourceUseCase } from "@application/use-case/resource/resource-use-cases";
import { validateBody, validateParams } from "@presentation/http/utils/validation";
import { Request, Response } from "express";
import { createResourceBodySchema, resourceIdParamsSchema, updateResourceBodySchema } from "../../schemas/resource.schema";
import { resCreated, resError, resNoContent, resNotFound, resPaged, resSuccess } from "@presentation/http/utils/response";
import { logger } from "@infrastructure/logging/logger";
import { getQueryOptional, parsePagination } from "@presentation/http/utils/query-parse";



export async function createResource(
    req:Request, 
    res: Response,
    useCases: ResourceUseCase
) : Promise<void> {
    try{
        const data = validateBody(createResourceBodySchema, req, res);
        if(data === undefined) return;

        const resource = await useCases.createResourceUseCase.execute({
            name: data.name,
            description: data.description,
            status: data.status,
            isDeleted: false
        });

        resCreated(res, resource);
    }catch(err){
        logger.error("createResource", {
            err: err instanceof Error ? {message: err.message, stack: err.stack} : err
        });

        resError(res, "Failed to create resource");
    }
}

export async function getResourceById(
    req: Request, 
    res: Response,
    useCases: ResourceUseCase
): Promise<void>{
    try{
        const params = validateParams(resourceIdParamsSchema, req, res);
        if(params === undefined) return;

        const resource = await useCases.getByIdResourceUsecase.execute(params.id);
        if(!resource){
            resNotFound(res, "Resource not found");
            return;
        }

        resSuccess(res, resource);
    }catch(err){
        logger.error("getResourceById", {
            err: err instanceof Error ? {message: err.message, stack: err.stack} : err
        });

        resError(res, "Failed to get resource");
    }
}


export async function getListResource(
    req: Request,
    res: Response,
    useCases: ResourceUseCase
): Promise<void>{
    try{
        const query = req.query as Record<string, string | string[] | undefined>;
        const { page, pSize } = parsePagination(query);
        const status = getQueryOptional(query, "status");
        const term = getQueryOptional(query, "term");

        const resources = await useCases.getListResourceUseCase.execute({
            status,
            term,
            page,
            pSize
        });

        resPaged(res, resources.data, {
            total: resources.total,
            page: resources.page,
            pSize: resources.pSize,
            totalPages: resources.totalPages
        });
    }catch(err){
        logger.error("getListResource", {
            err : err instanceof Error ? {message: err.message, stack: err.stack} : err
        });

        resError(res, "Failed to list resources");
    }
}

export async function updateResource(
    req: Request,
    res: Response,
    useCases: ResourceUseCase
): Promise<void>{
    try{
        const params = validateParams(resourceIdParamsSchema, req, res);
        if(params === undefined) return;

        const body = validateBody(updateResourceBodySchema, req, res);
        if(body === undefined) return;



        const resource = await useCases.updateResourceUseCase.execute(params.id, {
            ...(body.name !== undefined && { name: body.name} ),
            ...(body.description !== undefined && {description: body.description}),
            ...(body.type !== undefined && {type: body.type}),
            ...(body.status !== undefined && {status: body.status}),
            ...(body.isDeleted !== undefined && {isDeleted: body.isDeleted})
        });
        if(!resource){
            resNotFound(res, "Resource not found");
            return;
        }

        resSuccess(res, resource);
    }catch(err){
        logger.error("updateResource", {
            err: err instanceof Error ? {message: err.message, stack: err.stack} : err
        });
        resError(res, "Failed to update resource");
    }
}

export async function deleteResource(
    req: Request,
    res: Response,
    useCases: ResourceUseCase
): Promise<void>{
    try{
        const params = validateParams(resourceIdParamsSchema, req, res);
        if(params === undefined) return;
        
        const deleted = await useCases.deleteResourceUseCase.execute(params.id);

        if(!deleted){
            resNotFound(res, "Resource not found");
            return;
        }

        resNoContent(res);
    }catch(err){
        logger.error("deleteResource", {
            err: err instanceof Error ? {message: err.message, stack: err.stack} : err
        });
        resError(res, "Failed to delete resource");
    }
}