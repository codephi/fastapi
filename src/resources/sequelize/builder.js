function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
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
export var TableBuilder = /*#__PURE__*/ function() {
    "use strict";
    function TableBuilder(props) {
        _class_call_check(this, TableBuilder);
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
    _create_class(TableBuilder, [
        {
            key: "column",
            value: function column(column) {
                this.columns.push(column);
                return this;
            }
        },
        {
            key: "searchColumn",
            value: function searchColumn(column) {
                this.search.push(column);
                return this;
            }
        },
        {
            key: "table",
            value: function table(name) {
                this.buildTable();
                return this.parent.table(name);
            }
        },
        {
            key: "columnExists",
            value: function columnExists(name) {
                return this.columns.find(function(column) {
                    return column.name === name;
                }) !== undefined;
            }
        },
        {
            key: "createdUpdated",
            value: function createdUpdated() {
                if (this.auto.includes(AutoColumn.CREATED_AT) && !this.columnExists("createdAt")) {
                    this.column({
                        name: "createdAt",
                        type: "date",
                        imutable: true
                    });
                }
                if (this.auto.includes(AutoColumn.UPDATED_AT) && !this.columnExists("updatedAt")) {
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
export var AutoColumn;
(function(AutoColumn) {
    AutoColumn[AutoColumn["ID"] = 0] = "ID";
    AutoColumn[AutoColumn["CREATED_AT"] = 1] = "CREATED_AT";
    AutoColumn[AutoColumn["UPDATED_AT"] = 2] = "UPDATED_AT";
})(AutoColumn || (AutoColumn = {}));
export var SchemaBuilder = /*#__PURE__*/ function() {
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
