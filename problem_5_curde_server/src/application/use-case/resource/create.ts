import { ResourceRepository } from "@domain/resource/resource-repository";
import { CreateResource, ResourceEntity } from "@domain/resource/resources";


export class CreateResourceUseCase{
 constructor(private readonly resourceRepo: ResourceRepository){}

 async execute(data: CreateResource): Promise<ResourceEntity>{
    return this.resourceRepo.create(data);
 }
}