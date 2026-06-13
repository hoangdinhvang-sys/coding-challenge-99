import { Response } from "express";

export interface ApiSuccess<T = unknown> {
  data?: T;
  message?: string;
}

export interface ApiError{
    error: string;
    message?: string;
}

export interface ApiPagedMeta{
    total: number;
    page: number;
    pSize: number;
    totalPages: number;
}

export interface ApiPaged<T>{
    data: T[],
    meta: ApiPagedMeta;
    message?: string;
}

export function resSuccess<T>(
    res: Response,
    data: T,
    options?: {status?: number; message?: string}
): void{
    const status = options?.status ?? 200;
    const body: ApiSuccess<T> = { data, ...(options?.message && { message: options.message }) };
    res.status(status).json(body);
}

// status 201 -- Created.
export function resCreated<T>(
    res: Response,
    data: T,
    message?: string
){
    resSuccess(res, data, { status: 201, message });
}

// status 204 -- No Content (no body).
export function resNoContent(res: Response):void{
    res.status(204).send();
}

// status 500 -- Server error.
export function resError(
    res: Response,
    error: string,
    options?: {status?: number, message?: string}
){
    const status = options?.status ?? 500;
    const body: ApiError = {error, ...(options?.message && {message: options.message})};

    res.status(status).json(body);
}

// status 400 -- validation error
export function resValidationError(
    res: Response,
    error: string,
    message?: string
):void{
    resError(res, error, {status: 400, message});
}

// status 404 -- Not Found error
export function resNotFound(
    res: Response,
    error?: string,
    message?: string
): void{
    resError(res, error ?? "Not Found", {status: 404, message});
}

// status 401 -- Unauthorized error
export function resUnauthorized(
    res: Response,
    error?: string,
    message?: string
):void{
    resError(res, error ?? "Unauthorized", {status: 401, message});
}

// get paged data status 200
export function resPaged<T>(
    res: Response,
    data: T[],
    meta: ApiPagedMeta,
    message?: string
): void{
    const body: ApiPaged<T> = {data, meta, ...(message && {message})};
    res.status(200).json(body);
}