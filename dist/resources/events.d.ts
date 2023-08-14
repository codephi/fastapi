export interface EventCallback {
    (err: any, data: any): void;
}
export interface EventsStorage {
    [key: string]: EventCallback[];
}
export declare function on(modelName: string, action: string, callback: EventCallback): void;
export declare function emit(modelName: string, action: string, err: any, data?: any): void;
export declare function remove(modelName: string, action: string): void;
