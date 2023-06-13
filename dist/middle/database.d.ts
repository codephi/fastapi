import { Sequelize, Options } from 'sequelize';
declare class Global {
    sequelize: Sequelize | null;
    constructor();
    getSequelize(): Sequelize;
}
export declare const global: Global;
export declare function testDatabaseConnection(): Promise<void>;
export interface DatabaseConnect {
    database: string;
    username: string;
    password: string;
    options?: Options;
}
export declare function databaseConnect({ database, username, password, options }: DatabaseConnect): void;
export declare function setGlobalSequelize(sequelize: Sequelize): void;
export declare function getSequelize(): Sequelize | null;
export {};
//# sourceMappingURL=database.d.ts.map