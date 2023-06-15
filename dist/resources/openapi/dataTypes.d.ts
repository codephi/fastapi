interface DataTypes {
    [typeName: string]: {
        type: string;
        format?: string;
    };
}
export declare const dataTypes: DataTypes;
export declare const convertType: (sequelizeType: string) => {
    type: string;
    format?: string;
} | {
    maxLength: number;
    type: string;
    format?: string;
};
export {};
