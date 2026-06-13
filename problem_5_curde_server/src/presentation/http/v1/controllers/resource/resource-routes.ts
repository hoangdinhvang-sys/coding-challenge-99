import { ResourceUseCase } from "@application/use-case/resource/resource-use-cases";
import { Router } from "express";
import { createResource, deleteResource, getListResource, getResourceById, updateResource } from "./resource-controller";

export function resourceRoutes(useCases: ResourceUseCase): Router{
    const router = Router();
    
    router.post("/", (req, res) => createResource(req, res, useCases));
    router.get("/:id", (req, res) => getResourceById(req, res, useCases));
    router.get("/", (req, res) => getListResource(req, res, useCases));
    router.put("/:id", (req, res) => updateResource(req, res, useCases));
    router.delete("/:id", (req, res) => deleteResource(req, res, useCases));

    return router;
}