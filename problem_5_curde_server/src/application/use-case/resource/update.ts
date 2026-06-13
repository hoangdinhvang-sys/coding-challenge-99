import { ResourceRepository } from "@domain/resource/resource-repository";
import { ResourceEntity, UpdateResource } from "@domain/resource/resources";

export class UpdateResourceUseCase{
    constructor(private readonly resourceRepo: ResourceRepository){}

    async execute(id: string, data: UpdateResource): Promise<ResourceEntity | null>{
        return this.resourceRepo.update(id, data);
    }
}