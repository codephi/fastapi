import { Column, ColumnType, Schema } from './index';

export interface TableBuilderProps {
  name: string;
  parent: SchemaBuilder;
  auto: AutoColumn[];
}

export class TableBuilder {
  name: string;
  columns: any[] = [];
  search: string[] = [];
  parent: SchemaBuilder;
  private builded: boolean = false;
  auto: AutoColumn[] = [];

  constructor(props: TableBuilderProps) {
    this.name = props.name;
    this.parent = props.parent;
    this.auto = props.auto;
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

  private columnExists(name: string): boolean {
    return this.columns.find((column) => column.name === name) !== undefined;
  }

  private createdUpdated(): void {
    if (
      this.auto.includes(AutoColumn.CREATED_AT) &&
      !this.columnExists('createdAt')
    ) {
      this.column({
        name: 'createdAt',
        type: ColumnType.DATE,
        imutable: true
      });
    }

    if (
      this.auto.includes(AutoColumn.UPDATED_AT) &&
      !this.columnExists('updatedAt')
    ) {
      this.column({
        name: 'updatedAt',
        type: ColumnType.DATE
      });
    }

    if (this.auto.includes(AutoColumn.ID) && !this.columnExists('id')) {
      this.column({
        name: 'id',
        type: ColumnType.INT,
        autoIncrement: true,
        primaryKey: true
      });
    }
  }

  buildTable(): void {
    if (this.builded) return;
    this.createdUpdated();

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

export interface SchemaBuilderProps {
  auto?: AutoColumn[];
  updated?: boolean;
}

export enum AutoColumn {
  ID,
  CREATED_AT,
  UPDATED_AT
}

export class SchemaBuilder {
  auto: AutoColumn[] = [];
  schema: Schema = {
    tables: []
  };

  constructor(props: SchemaBuilderProps = {}) {
    this.auto = props.auto || [];
  }
  
  table(table: string): TableBuilder {
    return new TableBuilder({
      name: table,
      parent: this,
      auto: this.auto
    });
  }

  build(): Schema {
    return this.schema;
  }
}
