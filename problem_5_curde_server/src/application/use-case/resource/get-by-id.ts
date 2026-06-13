import { ResourceRepository } from "@domain/resource/resource-repository";
import { ResourceEntity } from "@domain/resource/resources";

export class GetByIdResourceUsecase{
    constructor(private readonly resourceRepo: ResourceRepository){}

    async execute(id: string): Promise<ResourceEntity | null>{
        return this.resourceRepo.getById(id);
    }
}