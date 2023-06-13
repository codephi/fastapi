"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaBuilder = exports.AutoColumn = exports.TableBuilder = void 0;
var TableBuilder = /** @class */ (function () {
    function TableBuilder(props) {
        this.columns = [];
        this.search = [];
        this.builded = false;
        this.auto = [];
        this.name = props.name;
        this.parent = props.parent;
        this.auto = props.auto;
    }
    TableBuilder.prototype.column = function (column) {
        this.columns.push(column);
        return this;
    };
    TableBuilder.prototype.searchColumn = function (column) {
        this.search.push(column);
        return this;
    };
    TableBuilder.prototype.table = function (name) {
        this.buildTable();
        return this.parent.table(name);
    };
    TableBuilder.prototype.columnExists = function (name) {
        return this.columns.find(function (column) { return column.name === name; }) !== undefined;
    };
    TableBuilder.prototype.createdUpdated = function () {
        if (this.auto.includes(AutoColumn.CREATED_AT) &&
            !this.columnExists('createdAt')) {
            this.column({
                name: 'createdAt',
                type: 'date',
                imutable: true
            });
        }
        if (this.auto.includes(AutoColumn.UPDATED_AT) &&
            !this.columnExists('updatedAt')) {
            this.column({
                name: 'updatedAt',
                type: 'date'
            });
        }
        if (this.auto.includes(AutoColumn.ID) && !this.columnExists('id')) {
            this.column({
                name: 'id',
                type: 'int',
                autoIncrement: true,
                primaryKey: true
            });
        }
    };
    TableBuilder.prototype.buildTable = function () {
        if (this.builded)
            return;
        this.createdUpdated();
        this.builded = true;
        this.parent.schema.tables.push({
            name: this.name,
            columns: this.columns,
            search: this.search
        });
    };
    TableBuilder.prototype.build = function () {
        this.buildTable();
        return this.parent.build();
    };
    return TableBuilder;
}());
exports.TableBuilder = TableBuilder;
var AutoColumn;
(function (AutoColumn) {
    AutoColumn[AutoColumn["ID"] = 0] = "ID";
    AutoColumn[AutoColumn["CREATED_AT"] = 1] = "CREATED_AT";
    AutoColumn[AutoColumn["UPDATED_AT"] = 2] = "UPDATED_AT";
})(AutoColumn || (exports.AutoColumn = AutoColumn = {}));
var SchemaBuilder = /** @class */ (function () {
    function SchemaBuilder(props) {
        if (props === void 0) { props = {}; }
        this.auto = [];
        this.schema = {
            tables: []
        };
        this.auto = props.auto || [];
    }
    SchemaBuilder.prototype.table = function (table) {
        return new TableBuilder({
            name: table,
            parent: this,
            auto: this.auto
        });
    };
    SchemaBuilder.prototype.build = function () {
        return this.schema;
    };
    return SchemaBuilder;
}());
exports.SchemaBuilder = SchemaBuilder;
