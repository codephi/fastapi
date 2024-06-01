"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaBuilder = exports.AutoColumn = exports.TableBuilder = void 0;
const index_1 = require("./index");
class TableBuilder {
    name;
    columns = [];
    search = [];
    parent;
    builded = false;
    auto = [];
    constructor(props) {
        this.name = props.name;
        this.parent = props.parent;
        this.auto = props.auto;
    }
    column(column) {
        this.columns.push(column);
        return this;
    }
    searchColumn(column) {
        this.search.push(column);
        return this;
    }
    table(name) {
        this.buildTable();
        return this.parent.table(name);
    }
    columnExists(name) {
        return this.columns.find((column) => column.name === name) !== undefined;
    }
    createdUpdated() {
        if (this.auto.includes(AutoColumn.CREATED_AT) &&
            !this.columnExists('createdAt')) {
            this.column({
                name: 'createdAt',
                type: index_1.ColumnType.DATE,
                imutable: true
            });
        }
        if (this.auto.includes(AutoColumn.UPDATED_AT) &&
            !this.columnExists('updatedAt')) {
            this.column({
                name: 'updatedAt',
                type: index_1.ColumnType.DATE
            });
        }
        if (this.auto.includes(AutoColumn.ID) && !this.columnExists('id')) {
            this.column({
                name: 'id',
                type: index_1.ColumnType.INT,
                autoIncrement: true,
                primaryKey: true
            });
        }
    }
    buildTable() {
        if (this.builded)
            return;
        this.createdUpdated();
        this.builded = true;
        this.parent.schema.tables.push({
            name: this.name,
            columns: this.columns,
            search: this.search
        });
    }
    build() {
        this.buildTable();
        return this.parent.build();
    }
}
exports.TableBuilder = TableBuilder;
var AutoColumn;
(function (AutoColumn) {
    AutoColumn[AutoColumn["ID"] = 0] = "ID";
    AutoColumn[AutoColumn["CREATED_AT"] = 1] = "CREATED_AT";
    AutoColumn[AutoColumn["UPDATED_AT"] = 2] = "UPDATED_AT";
})(AutoColumn || (exports.AutoColumn = AutoColumn = {}));
class SchemaBuilder {
    auto = [];
    schema = {
        tables: []
    };
    constructor(props = {}) {
        this.auto = props.auto || [];
    }
    table(table) {
        return new TableBuilder({
            name: table,
            parent: this,
            auto: this.auto
        });
    }
    build() {
        return this.schema;
    }
}
exports.SchemaBuilder = SchemaBuilder;
