import { SyncOptions } from 'sequelize';
import { global } from '../../middle/database';
import log from '../log';

export async function createTables(
  config: SyncOptions,
  closeConnection = false
): Promise<void> {
  const sequelize = global.getSequelize();

  try {
    await sequelize.sync(config);
    log.info('All tables created.');

    if (closeConnection) {
      await sequelize.close();
    }
  } catch (error) {
    log.error('Error creating tables:', error);
    await sequelize.close();
  }
}
