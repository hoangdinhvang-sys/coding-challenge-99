import type { 
    CreateResource ,
    ResourceEntity,
    ResourceFilter, 
    UpdateResource
} from "@domain/resource/resources"
import { PagingResult } from "../shared/paging-result";

export interface ResourceRepository{
    create(data: CreateResource) : Promise<ResourceEntity>;         
    getById(id: string): Promise<ResourceEntity | null>;
    getList(filter: ResourceFilter) : Promise<PagingResult<ResourceEntity>>;
    update(id: string, data: UpdateResource) : Promise<ResourceEntity | null>;
    delete(id: string) : Promise<boolean>;
}