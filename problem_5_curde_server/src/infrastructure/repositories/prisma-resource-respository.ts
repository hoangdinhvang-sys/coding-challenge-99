import { ResourceRepository } from "@domain/resource/resource-repository";
import { CreateResource,  ResourceEntity, ResourceFilter, UpdateResource } from "@domain/resource/resources";
import { PagingResult } from "@domain/shared/paging-result";
import { prisma } from "@infrastructure/database/prisma-client";


export class PrismaResourceRepository implements ResourceRepository{
    async create(data: CreateResource): Promise<ResourceEntity> {
        const resource = await prisma.resource.create({
            data:{
                name: data.name,
                type: data.type,
                description: data.description,
                status: data.status
            }
        });
        return resource;
    }

    async update(id: string, data: UpdateResource): Promise<ResourceEntity | null> {
        const resource = prisma.resource.update({
            where: {id},
            data:{
                ...(data.name !== undefined && {name: data.name}),
                ...(data.type !== undefined && {type: data.type}),
                ...(data.description !== undefined && {description: data.description}),
                ...(data.status !== undefined && {status: data.status}),
                ...(data.isDeleted !== undefined && {isDeleted: data.isDeleted})
            }
        }).catch(() => null);

        return resource;
    }

    async delete(id: string): Promise<boolean> {
        const result = await prisma.resource.deleteMany({where:{id}});
        return result.count > 0;
    }

    async getById(id: string): Promise<ResourceEntity | null> {
        const resource = await prisma.resource.findUnique({
            where: {id}
        });

        return resource;
    }

    async getList(filter: ResourceFilter): Promise<PagingResult<ResourceEntity>> {
        const page = filter.page ?? 1;
        const pSize = filter.pSize ?? 10;
        const start = (page - 1) * pSize;

        const where = {
                isDeleted: false,
                ...(filter.status &&{
                    status: filter.status
                }),

                ...(filter.type &&{
                    type: filter.type
                }),

                ...(filter.term &&{
                    OR:[
                        {
                            name: {
                                containts: filter.term,
                                mode: "insensitive"
                            }
                        },
                        {
                            description:{
                                containts: filter.term,
                                mode: "insensitive"
                            }
                        }
                    ]
                })
            };

        const [resources, total] = await Promise.all([
                prisma.resource.findMany({
                where: where,
                orderBy: {createdAt: "desc"},
                skip: start,
                take: pSize
            }),
            prisma.resource.count({where})
        ]);

        return {
            data: resources,
            total,
            pSize,
            page,
            totalPages: Math.ceil(total/pSize)
        }
    }
}