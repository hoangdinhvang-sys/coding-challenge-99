import "dotenv/config";
import { CreateResourceUseCase } from "@application/use-case/resource/create"
import { DeleteResourceUseCase } from "@application/use-case/resource/delete";
import { GetByIdResourceUsecase } from "@application/use-case/resource/get-by-id";
import { GetListResourceUseCase } from "@application/use-case/resource/get-list";
import { UpdateResourceUseCase } from "@application/use-case/resource/update";
import { ResourceUseCase } from "@application/use-case/resource/resource-use-cases"
import { config } from "@config";
import { logger } from "@infrastructure/logging/logger";
import { PrismaResourceRepository } from "@infrastructure/repositories/prisma-resource-respository"
import { createApp } from "@presentation/http/app";

console.log("DATABASE_URL----------------------------------:", process.env.DATABASE_URL);

const resourceRepository = new PrismaResourceRepository();

const resourceUseCases: ResourceUseCase = {
    createResourceUseCase: new CreateResourceUseCase(resourceRepository),
    getListResourceUseCase: new GetListResourceUseCase(resourceRepository),
    getByIdResourceUsecase: new GetByIdResourceUsecase(resourceRepository),
    updateResourceUseCase: new UpdateResourceUseCase(resourceRepository),
    deleteResourceUseCase: new DeleteResourceUseCase(resourceRepository)
};

const app = createApp({useCases: resourceUseCases});

app.listen(config.port, () => {
    logger.info(`Server is running on http://localhost:${config.port}`);
})