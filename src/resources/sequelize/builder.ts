import { Column, Schema } from './index';

export class TableBuilder {
  name: string;
  columns: any[] = [];
  search: string[] = [];
  parent: SchemaBuilder;
  private builded: boolean = false;
  constructor(parent: SchemaBuilder, name: string) {
    this.name = name;
    this.parent = parent;
  }

  column(column: Column): TableBuilder {
    this.columns.push(column);
    return this;
  }

  searchColumn(column: string): TableBuilder {
    this.search.push(column);
    return this;
  }

  table(name: string) {
    this.buildTable();
    return this.parent.table(name);
  }

  buildTable(): void {
    if (this.builded) return;
    this.builded = true;
    this.parent.schema.tables.push({
      name: this.name,
      columns: this.columns,
      search: this.search
    });
  }

  build(): Schema {
    this.buildTable();
    return this.parent.build();
  }
}

export class SchemaBuilder {
  schema: Schema = {
    tables: []
  };

  table(table: string): TableBuilder {
    return new TableBuilder(this, table);
  }

  build(): Schema {
    return this.schema;
  }
}
