import { ResourceUseCase } from "@application/use-case/resource/resource-use-cases";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CreateResourceUseCase } from "@application/use-case/resource/create";
import { GetListResourceUseCase } from "@application/use-case/resource/get-list";
import { GetByIdResourceUsecase } from "@application/use-case/resource/get-by-id";
import { UpdateResourceUseCase } from "@application/use-case/resource/update";
import { DeleteResourceUseCase } from "@application/use-case/resource/delete";
import { v4 as uuidv4 } from "uuid";
import { createResource, deleteResource, getListResource, getResourceById, updateResource } 
from "@presentation/http/v1/controllers/resource/resource-controller";

const mockCreate = jest.fn<CreateResourceUseCase["execute"]>();
const mockList = jest.fn<GetListResourceUseCase["execute"]>();
const mockGet = jest.fn<GetByIdResourceUsecase["execute"]>();
const mockUpdate = jest.fn<UpdateResourceUseCase["execute"]>();
const mockDelete = jest.fn<DeleteResourceUseCase["execute"]>();

function mockUseCases(): ResourceUseCase {
  return {
    createResourceUseCase: { execute: mockCreate } as unknown as ResourceUseCase["createResourceUseCase"],
    getListResourceUseCase: { execute: mockList } as unknown as ResourceUseCase["getListResourceUseCase"],
    getByIdResourceUsecase: { execute: mockGet } as unknown as ResourceUseCase["getByIdResourceUsecase"],
    updateResourceUseCase: { execute: mockUpdate } as unknown as ResourceUseCase["updateResourceUseCase"],
    deleteResourceUseCase: { execute: mockDelete } as unknown as ResourceUseCase["deleteResourceUseCase"],
  };
}

const mockRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);

  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("resource controller", () => {
  describe("createResource", () => {
    it("should return 201 and resource when name is valid", async () => {
      const req = { body: { name: " Test ", description: "d", status: "active" } } as unknown as Request;
      const res = mockRes();
      const useCases = mockUseCases();
      const created = {
        id: crypto.randomUUID(),
        name: "Test",
        description: "d",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      };
      mockCreate.mockResolvedValue(created);

      await createResource(req, res as any, useCases);

      expect(mockCreate).toHaveBeenCalledWith({
        name: "Test",
        description: "d",
        status: "active",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: created });
    });

    it("should return 400 when name is missing", async () => {
      const req = { body: {} } as unknown as Request;
      const res = mockRes();

      await createResource(req, res as any, mockUseCases());

      expect(mockCreate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "name is required and must be a non-empty string",
      });
    });

    it("should return 400 when name is empty string", async () => {
      const req = { body: { name: "   " } } as unknown as Request;
      const res = mockRes();

      await createResource(req, res as any, mockUseCases());

      expect(mockCreate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on use case error", async () => {
      const req = { body: { name: "Ok" } } as unknown as Request;
      const res = mockRes();
      mockCreate.mockRejectedValue(new Error("DB error"));
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      await createResource(req, res as any, mockUseCases());

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to create resource" });
      spy.mockRestore();
    });
  });

  describe("listResources", () => {
    it("should call use case with query params and return result", async () => {
      const req = {
        query: { status: "active", term: "foo", page: "2", pSize: "5" }
      } as unknown as Request;
      const res = mockRes();
      const result = { data: [], total: 0, page: 2, pSize: 5, totalPages: 0 };
      mockList.mockResolvedValue(result);

      await getListResource(req, res as any, mockUseCases());

      expect(mockList).toHaveBeenCalledWith({
        status: "active",
        term: "foo",
        page: 2,
        pSize: 5,
      });
      expect(res.json).toHaveBeenCalledWith({
        data: result.data,
        meta: { total: 0, page: 2, pSize: 5, totalPages: 0 },
      });
    });

    it("should return 500 on use case error", async () => {
      const req = { query: {} } as unknown as Request;
      const res = mockRes();
      mockList.mockRejectedValue(new Error("DB error"));
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      await getListResource(req, res as any, mockUseCases());

      expect(mockList).toHaveBeenCalledWith({ page: 1, pSize: 10 });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to list resources" });
      spy.mockRestore();
    });
  });

  describe("getResource", () => {
    it("should return resource when found", async () => {
      const id = uuidv4();
      const req = { params: { id } } as unknown as Request;
      const res = mockRes();
      const resource = {
        id: id,
        name: "R1",
        type: "",
        description: null,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      };
      mockGet.mockResolvedValue(resource);

      await getResourceById(req, res as any, mockUseCases());

      expect(mockGet).toHaveBeenCalledWith(id);
      expect(res.json).toHaveBeenCalledWith({ data: resource });
    });

    it("should return 404 when not found", async () => {
      const id = uuidv4();

      const req = { params: { id } } as unknown as Request;
      const res = mockRes();
      mockGet.mockResolvedValue(null);

      await getResourceById(req, res as any, mockUseCases());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Resource not found" });
    });

    it("should return 500 on use case error", async () => {
      const id = uuidv4();

      const req = { params: { id } } as unknown as Request;
      const res = mockRes();
      mockGet.mockRejectedValue(new Error("DB error"));
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      await getResourceById(req, res as any, mockUseCases());

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to get resource" });
      spy.mockRestore();
    });
  });

  describe("updateResource", () => {
    it("should return updated resource when found", async () => {
      const id = uuidv4();
      const req = {
        params: { id: id },
        body: { name: " New Name ", description: "d", status: "inactive" },
      } as unknown as Request;
      const res = mockRes();
      const updated = {
        id: id,
        name: "New Name",
        type: "",
        description: "d",
        status: "inactive",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      };
      mockUpdate.mockResolvedValue(updated);

      await updateResource(req, res as any, mockUseCases());

      expect(mockUpdate).toHaveBeenCalledWith(id, {
        name: "New Name",
        description: "d",
        status: "inactive",
      });
      expect(res.json).toHaveBeenCalledWith({ data: updated });
    });

    it("should return 400 when name is not a string", async () => {
      const id = uuidv4();
      const req = { params: { id: id }, body: { name: 123 } } as unknown as Request;
      const res = mockRes();

      await updateResource(req, res as any, mockUseCases());

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    it("should return 404 when resource not found", async () => {
      const id = uuidv4();

      const req = { params: { id }, body: { name: "X" } } as unknown as Request;
      const res = mockRes();
      mockUpdate.mockResolvedValue(null);

      await updateResource(req, res as any, mockUseCases());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Resource not found" });
    });
  });

  describe("deleteResource", () => {
    it("should return 204 when deleted", async () => {
      const id = uuidv4();

      const req = { params: { id } } as unknown as Request;
      const res = mockRes();
      mockDelete.mockResolvedValue(true);

      await deleteResource(req, res as any, mockUseCases());

      expect(mockDelete).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("should return 404 when not found", async () => {
      const id = uuidv4();

      const req = { params: { id } } as unknown as Request;
      const res = mockRes();
      mockDelete.mockResolvedValue(false);

      await deleteResource(req, res as any, mockUseCases());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Resource not found" });
    });

    it("should return 500 on use case error", async () => {
      const id = uuidv4();

      const req = { params: { id } } as unknown as Request;
      const res = mockRes();
      mockDelete.mockRejectedValue(new Error("DB error"));
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      await deleteResource(req, res as any, mockUseCases());

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete resource" });
      spy.mockRestore();
    });
  });
});
