import { PrismaResourceRepository } from "@infrastructure/repositories/prisma-resource-respository";
import { CreateResourceUseCase } from "../create";
import { CreateResource, ResourceEntity, ResourceFilter, UpdateResource } from "@domain/resource/resources";
import { describe, expect, it, jest } from "@jest/globals";
import { v4 as uuidv4 } from "uuid";
import { DeleteResourceUseCase } from "../delete";
import { GetByIdResourceUsecase } from "../get-by-id";
import { GetListResourceUseCase } from "../get-list";
import { UpdateResourceUseCase } from "../update";
import { PagingResult } from "@domain/shared/paging-result";
import { ResourceRepository } from "@domain/resource/resource-repository";

const mockCreate = jest.fn<PrismaResourceRepository["create"]>();
const mockList = jest.fn<PrismaResourceRepository["getList"]>();
const mockGet = jest.fn<PrismaResourceRepository["getById"]>();
const mockUpdate = jest.fn<PrismaResourceRepository["update"]>();
const mockDelete = jest.fn<PrismaResourceRepository["delete"]>();

function makeMockRepository(overrides?: Partial<PrismaResourceRepository>): ResourceRepository {
  return {
    create: { execute: mockCreate } as unknown as PrismaResourceRepository["create"],
    getById: { execute: mockGet } as unknown as PrismaResourceRepository["getById"],
    getList: { execute: mockList } as unknown as PrismaResourceRepository["getList"],
    update: { execute: mockUpdate } as unknown as PrismaResourceRepository["update"],
    delete: { execute: mockDelete } as unknown as PrismaResourceRepository["delete"],
    ...overrides,
  };
}

describe("CreateResourceUseCase", () => {
  it("should call repository.create with input and return the result", async () => {
    const input: CreateResource = {
      name: "Test Resource",
      description: "A test",
      status: "active",
    };
    const created: ResourceEntity = {
      id: "id-1",
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    };
    
    const create = mockCreate.mockResolvedValue(created);
    const repo = makeMockRepository({ create });
    const useCase = new CreateResourceUseCase(repo);

    const result = await useCase.execute(input);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(input);
    expect(result).toEqual(created);
  });

  it("should pass through repository result when no description or status", async () => {
    const input: CreateResource = { name: "Minimal" };
    const created: ResourceEntity = {
      id: "id-2",
      name: "Minimal",
      description: null,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    };
    const create = mockCreate.mockResolvedValue(created);
    const useCase = new CreateResourceUseCase(makeMockRepository({ create }));

    const result = await useCase.execute(input);

    expect(create).toHaveBeenCalledWith({ name: "Minimal" });
    expect(result).toEqual(created);
  });
});


describe("DeleteResourceUseCase", () => {
  it("should call repository.delete with id and return true when deleted", async () => {
    const deleteFn = mockDelete.mockResolvedValue(true);
    const useCase = new DeleteResourceUseCase(makeMockRepository({ delete: deleteFn }));

    const result = await useCase.execute("resource-1");

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(deleteFn).toHaveBeenCalledWith("resource-1");
    expect(result).toBe(true);
  });

  it("should return false when repository returns false (not found)", async () => {
    const deleteFn = mockDelete.mockResolvedValue(false);
    const useCase = new DeleteResourceUseCase(makeMockRepository({ delete: deleteFn }));

    const result = await useCase.execute("missing-id");

    expect(deleteFn).toHaveBeenCalledWith("missing-id");
    expect(result).toBe(false);
  });
});


describe("GetResourceUseCase", () => {
  it("should call repository.findById and return the resource", async () => {
    const id = "resource-123";
    const entity: ResourceEntity = {
      id,
      name: "Test",
      description: "Desc",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    };
    const getById = mockGet.mockResolvedValue(entity);
    const useCase = new GetByIdResourceUsecase(makeMockRepository({ getById }));

    const result = await useCase.execute(id);

    expect(getById).toHaveBeenCalledTimes(1);
    expect(getById).toHaveBeenCalledWith(id);
    expect(result).toEqual(entity);
  });

  it("should return null when repository returns null", async () => {
    const getById = mockGet.mockResolvedValue(null);
    const useCase = new GetByIdResourceUsecase(makeMockRepository({ getById }));

    const result = await useCase.execute("missing-id");

    expect(getById).toHaveBeenCalledWith("missing-id");
    expect(result).toBeNull();
  });
});


describe("ListResourcesUseCase", () => {
  it("should call repository.list with filter and return paginated result", async () => {
    const filter: ResourceFilter = { page: 1, pSize: 10, status: "active" };
    const result: PagingResult<ResourceEntity> = {
      data: [
        {
          id: "id-1",
          name: "R1",
          description: null,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false
        },
      ],
      total: 1,
      page: 1,
      pSize: 10,
      totalPages: 1,
    };
    const getList = mockList.mockResolvedValue(result);
    const useCase = new GetListResourceUseCase(makeMockRepository({ getList }));

    const actual = await useCase.execute(filter);

    expect(getList).toHaveBeenCalledTimes(1);
    expect(getList).toHaveBeenCalledWith(filter);
    expect(actual).toEqual(result);
  });

  it("should pass empty filter when no params provided", async () => {
    const getList = mockList.mockResolvedValue({ data: [], total: 0, page: 1, pSize: 10, totalPages: 0 });
    const useCase = new GetListResourceUseCase(makeMockRepository({ getList }));

    await useCase.execute({});

    expect(getList).toHaveBeenCalledWith({});
  });
});


describe("UpdateResourceUseCase", () => {
  it("should call repository.update with id and input and return the resource", async () => {
    const id = "resource-1";
    const input: UpdateResource = { name: "Updated", status: "inactive" };
    const updated: ResourceEntity = {
      id,
      name: "Updated",
      description: null,
      status: "inactive",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    };
    const update = mockUpdate.mockResolvedValue(updated);
    const useCase = new UpdateResourceUseCase(makeMockRepository({ update }));

    const result = await useCase.execute(id, input);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(id, input);
    expect(result).toEqual(updated);
  });

  it("should return null when repository returns null (not found)", async () => {
    const update = mockUpdate.mockResolvedValue(null);
    const useCase = new UpdateResourceUseCase(makeMockRepository({ update }));

    const result = await useCase.execute("missing", { name: "New" });

    expect(update).toHaveBeenCalledWith("missing", { name: "New" });
    expect(result).toBeNull();
  });
});
