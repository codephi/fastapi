import { Sequelize, Options } from 'sequelize';

class Global {
  sequelize: Sequelize | null;

  constructor() {
    this.sequelize = null;
  }

  getSequelize(): Sequelize {
    if (!this.sequelize) throw new Error('Database connection not established');

    return this.sequelize;
  }
}

export const global = new Global();

export async function testDatabaseConnection(): Promise<void> {
  if (global.sequelize) {
    try {
      await global.sequelize.authenticate();
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  } else {
    console.error('Database connection not established');
  }
}

export interface DatabaseConnect {
  database: string;
  username: string;
  password: string;
  options?: Options;
}

export function databaseConnect({
  database,
  username,
  password,
  options
}: DatabaseConnect): void {
  setGlobalSequelize(new Sequelize(database, username, password, options));
}

export function setGlobalSequelize(sequelize: Sequelize): void {
  global.sequelize = sequelize;
}

export function getSequelize(): Sequelize | null {
  return global.sequelize;
}
