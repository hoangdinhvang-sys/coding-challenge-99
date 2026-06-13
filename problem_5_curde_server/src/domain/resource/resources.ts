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
    type?: string;
    description?: string | null;
    status?: string;
}

export interface UpdateResource{
    name?: string;
    type?: string;
    description?: string | null;
    status?: string;
}

export interface ResourceFilter{
    status?: string;
    type?: string;
    term?: string;
    page?: number;
    pSize?: number;
}