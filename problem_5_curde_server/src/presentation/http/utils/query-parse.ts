const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;
const DEFAULT_SIZE_MAX = 100;

export type QueryLike = Record<string, string | string[] | undefined>;

export interface PaginationParams {
    page: number;
    pSize: number;
}

export function parsePagination(
    query: QueryLike,
    options?: { defaultPage?: number, defaultSize?:number, defaultMaxSize? :number} 
): PaginationParams{
    const defaultPage = options?.defaultPage ?? DEFAULT_PAGE;
    const defaultSize = options?.defaultPage ?? DEFAULT_SIZE;
    const maxSize = options?.defaultMaxSize ?? DEFAULT_SIZE_MAX;

    const query_page = query.page != null ? parseInt(String(query.page), 10) : defaultPage;
    const query_size = query.pSize != null ? parseInt(String(query.pSize), 10) : defaultSize;

    const page = Number.isNaN(query_page) || query_page < 1 ? defaultPage : query_page;
    const pSize = Number.isNaN(query_size) || query_size < 1 ? defaultSize : Math.min(query_size, maxSize);

    return { page, pSize };
}

export function getQueryOptional(query: QueryLike, key: string):string|undefined{
    const value = query[key];
    return typeof value === "string" ? value : undefined;
}