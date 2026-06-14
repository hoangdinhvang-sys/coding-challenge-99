export interface ResourceEntity{
    id: string;
    name: string;
    description: string| null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

export interface CreateResource{
    name: string;
    description?: string | null;
    status?: string;
    isDeleted?: boolean;
}

export interface UpdateResource{
    name?: string;
    description?: string | null;
    status?: string;
    isDeleted?: boolean;
}

export interface ResourceFilter{
    status?: string;
    term?: string;
    page?: number;
    pSize?: number;
}