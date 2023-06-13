"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    AutoColumn: function() {
        return AutoColumn;
    },
    TableBuilder: function() {
        return TableBuilder;
    },
    SchemaBuilder: function() {
        return SchemaBuilder;
    }
});
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class TableBuilder {
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
        return this.columns.find((column)=>column.name === name) !== undefined;
    }
    createdUpdated() {
        if (this.auto.includes(AutoColumn.CREATED_AT) && !this.columnExists('createdAt')) {
            this.column({
                name: 'createdAt',
                type: 'date',
                imutable: true
            });
        }
        if (this.auto.includes(AutoColumn.UPDATED_AT) && !this.columnExists('updatedAt')) {
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
    }
    buildTable() {
        if (this.builded) return;
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
    constructor(props){
        _define_property(this, "name", void 0);
        _define_property(this, "columns", []);
        _define_property(this, "search", []);
        _define_property(this, "parent", void 0);
        _define_property(this, "builded", false);
        _define_property(this, "auto", []);
        this.name = props.name;
        this.parent = props.parent;
        this.auto = props.auto;
    }
}
var AutoColumn;
(function(AutoColumn) {
    AutoColumn[AutoColumn["ID"] = 0] = "ID";
    AutoColumn[AutoColumn["CREATED_AT"] = 1] = "CREATED_AT";
    AutoColumn[AutoColumn["UPDATED_AT"] = 2] = "UPDATED_AT";
})(AutoColumn || (AutoColumn = {}));
class SchemaBuilder {
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
    constructor(props = {}){
        _define_property(this, "auto", []);
        _define_property(this, "schema", {
            tables: []
        });
        this.auto = props.auto || [];
    }
}
f (this.auto.includes(AutoColumn.UPDATED_AT) && !this.columnExists("updatedAt")) {
                    this.column({
                        name: "updatedAt",
                        type: "date"
                    });
                }
                if (this.auto.includes(AutoColumn.ID) && !this.columnExists("id")) {
                    this.column({
                        name: "id",
                        type: "int",
                        autoIncrement: true,
                        primaryKey: true
                    });
                }
            }
        },
        {
            key: "buildTable",
            value: function buildTable() {
                if (this.builded) return;
                this.createdUpdated();
                this.builded = true;
                this.parent.schema.tables.push({
                    name: this.name,
                    columns: this.columns,
                    search: this.search
                });
            }
        },
        {
            key: "build",
            value: function build() {
                this.buildTable();
                return this.parent.build();
            }
        }
    ]);
    return TableBuilder;
}();
var AutoColumn;
(function(AutoColumn) {
    AutoColumn[AutoColumn["ID"] = 0] = "ID";
    AutoColumn[AutoColumn["CREATED_AT"] = 1] = "CREATED_AT";
    AutoColumn[AutoColumn["UPDATED_AT"] = 2] = "UPDATED_AT";
})(AutoColumn || (AutoColumn = {}));
var SchemaBuilder = /*#__PURE__*/ function() {
    "use strict";
    function SchemaBuilder() {
        var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        _class_call_check(this, SchemaBuilder);
        _define_property(this, "auto", []);
        _define_property(this, "schema", {
            tables: []
        });
        this.auto = props.auto || [];
    }
    _create_class(SchemaBuilder, [
        {
            key: "table",
            value: function table(table) {
                return new TableBuilder({
                    name: table,
                    parent: this,
                    auto: this.auto
                });
            }
        },
        {
            key: "build",
            value: function build() {
                return this.schema;
            }
        }
    ]);
    return SchemaBuilder;
}();
