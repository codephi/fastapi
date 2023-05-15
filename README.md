# Auto Api

Essa api é gerada a partir de um objeto json, do banco de dados, api e especificação OpenAPI. 

## Exemplo
```
{
  "tables": [
    {
      "name": "Clients",
      "columns": [
        {
          "name": "id",
          "type": "SERIAL",
          "constraints": ["PRIMARY KEY"]
        },
        {
          "name": "name",
          "type": "VARCHAR(50)",
          "constraints": ["NOT NULL"]
        }
      ]
    },
    {
      "name": "Tags",
      "columns": [
        {
          "name": "id",
          "type": "SERIAL",
          "constraints": ["PRIMARY KEY"]
        },
        {
          "name": "name",
          "type": "VARCHAR(50)",
          "constraints": ["NOT NULL"]
        },
        {
          "name": "client_id",
          "type": "INTEGER",
          "constraints": ["REFERENCES Clients (id)"]
        }
      ]
    }
  ]
}

```