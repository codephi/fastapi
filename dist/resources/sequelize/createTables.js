"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = void 0;
const database_1 = require("../../middle/database");
const log_1 = require("../log");
async function createTables(config, closeConnection = false) {
    const sequelize = database_1.global.getSequelize();
    try {
        await sequelize.sync(config);
        log_1.default.info('All tables created.');
        if (closeConnection) {
            await sequelize.close();
        }
    }
    catch (error) {
        log_1.default.error('Error creating tables:', error);
        await sequelize.close();
    }
}
exports.createTables = createTables;
//# sourceMappingURL=createTables.js.map