import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerResourcePaths } from "./resource-openapi";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registerResourcePaths(registry);

const generator = new OpenApiGeneratorV3(
  registry.definitions
);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
  },
});