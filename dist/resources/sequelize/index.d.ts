import { DataTypes, Model, Sequelize } from 'sequelize';
export type DataTypesResult = DataTypes.StringDataType | DataTypes.NumberDataType | DataTypes.DateDataType | DataTypes.DataType;
export interface Schema {
    tables: Table[];
}
export interface Table {
    name: string;
    columns: Column[];
    search?: string[];
}
export declare enum ColumnType {
    STRING = "string",
    CHAR = "char",
    TEXT = "text",
    DATE = "date",
    TIME = "time",
    BOOLEAN = "boolean",
    UUID = "uuid",
    ENUM = "enum",
    JSON = "json",
    INTEGER = "integer",
    INT = "int",
    SERIAL = "int",
    FLOAT = "float",
    CODE = "code"
}
export interface Column {
    name: string;
    type: ColumnType;
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
export declare function generateResourcesFromJSON(jsonSchema: Schema, sequelize: Sequelize): Resources;
