"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequelize = exports.setGlobalSequelize = exports.databaseConnect = exports.testDatabaseConnection = exports.global = void 0;
const sequelize_1 = require("sequelize");
class Global {
    constructor() {
        this.sequelize = null;
    }
    getSequelize() {
        if (!this.sequelize)
            throw new Error('Database connection not established');
        return this.sequelize;
    }
}
exports.global = new Global();
async function testDatabaseConnection() {
    if (exports.global.sequelize) {
        await exports.global.sequelize.authenticate();
    }
    else {
        throw new Error('Database connection not established');
    }
}
exports.testDatabaseConnection = testDatabaseConnection;
function databaseConnect({ database, username, password, options }) {
    setGlobalSequelize(new sequelize_1.Sequelize(database, username, password, options));
}
exports.databaseConnect = databaseConnect;
function setGlobalSequelize(sequelize) {
    exports.global.sequelize = sequelize;
}
exports.setGlobalSequelize = setGlobalSequelize;
function getSequelize() {
    return exports.global.sequelize;
}
exports.getSequelize = getSequelize;
//# sourceMappingURL=database.js.map