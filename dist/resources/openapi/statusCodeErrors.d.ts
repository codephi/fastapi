export interface ErrorResponse {
    type: string;
    title: string;
    status: number;
    detail: string;
}
export declare const internalServerError: () => ErrorResponse;
export declare const notFound: () => ErrorResponse;
export declare const badRequest: (message: string) => ErrorResponse;
export declare const unauthorized: () => ErrorResponse;
export declare const forbidden: () => ErrorResponse;
export declare const conflict: () => ErrorResponse;
