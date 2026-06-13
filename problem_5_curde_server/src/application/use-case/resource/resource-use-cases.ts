import { CreateResourceUseCase } from "./create";
import { DeleteResourceUseCase } from "./delete";
import { GetByIdResourceUsecase } from "./get-by-id";
import { GetListResourceUseCase } from "./get-list";
import { UpdateResourceUseCase } from "./update";

export interface ResourceUseCase{
    createResourceUseCase: CreateResourceUseCase,
    deleteResourceUseCase: DeleteResourceUseCase,
    updateResourceUseCase: UpdateResourceUseCase,
    getByIdResourceUsecase: GetByIdResourceUsecase,
    getListResourceUseCase: GetListResourceUseCase
}