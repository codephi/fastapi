import { Column, Schema } from './index';
export interface TableBuilderProps {
    name: string;
    parent: SchemaBuilder;
    auto: AutoColumn[];
}
export declare class TableBuilder {
    name: string;
    columns: any[];
    search: string[];
    parent: SchemaBuilder;
    private builded;
    auto: AutoColumn[];
    constructor(props: TableBuilderProps);
    column(column: Column): TableBuilder;
    searchColumn(column: string): TableBuilder;
    table(name: string): TableBuilder;
    private columnExists;
    private createdUpdated;
    buildTable(): void;
    build(): Schema;
}
export interface SchemaBuilderProps {
    auto?: AutoColumn[];
    updated?: boolean;
}
export declare enum AutoColumn {
    ID = 0,
    CREATED_AT = 1,
    UPDATED_AT = 2
}
export declare class SchemaBuilder {
    auto: AutoColumn[];
    schema: Schema;
    constructor(props?: SchemaBuilderProps);
    table(table: string): TableBuilder;
    build(): Schema;
}
