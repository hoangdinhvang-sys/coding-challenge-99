import { ResourceUseCase } from "@application/use-case/resource/resource-use-cases";
import express  from "express";
import { requestLogger } from "./middleware/request-logger";
import swaggerUi from "swagger-ui-express";
import { resourceRoutes } from "./v1/controllers/resource/resource-routes";
import { openApiDocument } from "./openapi/openapi";
import { errorHandler } from "./middleware/error-handler";

export interface AppOptions{
    useCases: ResourceUseCase;
}

export function createApp(options: AppOptions): express.Express{
    const {useCases} = options;
    const app = express();

    app.use(requestLogger);
    app.use(express.json());

    app.use("/app/v1/resources", resourceRoutes(useCases));

    app.get("/health", (_req, res) => {
        res.json({status: "ok"});
    })

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(openApiDocument)
    );
    
    app.use(errorHandler);

    return app;
}