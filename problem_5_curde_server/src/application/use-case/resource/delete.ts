import { ResourceRepository } from "@domain/resource/resource-repository";

export class DeleteResourceUseCase{
    constructor(private readonly resourceRepo: ResourceRepository){}

    async execute(id: string): Promise<boolean>{
        return this.resourceRepo.delete(id);
    }
}