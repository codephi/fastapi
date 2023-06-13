import { DataTypes, Model } from 'sequelize';
export type DataTypesResult = DataTypes.StringDataType | DataTypes.NumberDataType | DataTypes.DateDataType | DataTypes.DataType;
export interface Schema {
    tables: Table[];
}
export interface Table {
    name: string;
    columns: Column[];
    search?: string[];
}
export interface Column {
    name: string;
    type: string;
    autoIncrement?: boolean;
    values?: string[];
    min?: number;
    max?: number;
    imutable?: boolean;
    required?: boolean;
    unique?: boolean;
    defaultValue?: any;
    reference?: string;
    primaryKey?: boolean;
    allowNull?: boolean;
    search?: string[];
    label?: string;
    maxLength?: number;
    binary?: boolean;
    length?: number;
    decimals?: number;
}
export interface Relationship {
    model: typeof SequelizeModel;
    as: string;
}
export declare class SequelizeModel extends Model {
}
export interface Resource {
    model: typeof SequelizeModel;
    name: string;
    primaryKey: string | null;
    columns: Record<string, Column>;
    relationships?: Relationship[];
    search?: string[];
}
export interface Resources {
    [resurceName: string]: Resource;
}
export declare function importResources(target: string | Schema): Resources;
