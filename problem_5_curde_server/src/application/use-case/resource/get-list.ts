import { ResourceRepository } from "@domain/resource/resource-repository";
import { ResourceEntity, ResourceFilter } from "@domain/resource/resources";
import { PagingResult } from "@domain/shared/paging-result";

export class GetListResourceUseCase{
    constructor(private readonly resourceRepo: ResourceRepository){}

    async execute(filter: ResourceFilter) : Promise<PagingResult<ResourceEntity>>{
        return this.resourceRepo.getList(filter);
    }
}