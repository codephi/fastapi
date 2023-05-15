# Gerador de API Dinâmico

Este projeto é uma ferramenta para gerar uma API REST completa com documentação OpenAPI a partir de um arquivo `model.json`.

## Como usar

1. Clone este repositório para a sua máquina local.
2. Adicione o seu arquivo `model.json` na raiz do projeto.

### Exemplo de um arquivo `model.json`:

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "type": "INTEGER",
          "constraints": ["PRIMARY KEY", "NOT NULL"]
        },
        {
          "name": "name",
          "type": "VARCHAR(255)",
          "constraints": ["NOT NULL"]
        },
        {
          "name": "email",
          "type": "VARCHAR(255)",
          "constraints": ["NOT NULL"]
        }
      ]
    },
    {
      "name": "posts",
      "columns": [
        {
          "name": "id",
          "type": "INTEGER",
          "constraints": ["PRIMARY KEY", "NOT NULL"]
        },
        {
          "name": "title",
          "type": "VARCHAR(255)",
          "constraints": ["NOT NULL"]
        },
        {
          "name": "content",
          "type": "TEXT",
          "constraints": ["NOT NULL"]
        },
        {
          "name": "userId",
          "type": "INTEGER",
          "constraints": ["NOT NULL", "REFERENCES users (id)"]
        }
      ]
    }
  ]
}
```

Neste exemplo, duas tabelas serão criadas: `users` e `posts`. A tabela `posts` tem uma chave estrangeira que referencia a tabela `users`.

A partir desse arquivo `model.json`, o projeto irá gerar uma API com endpoints para realizar operações CRUD (Criar, Ler, Atualizar, Deletar) para as tabelas `users` e `posts`.

## Endpoints gerados

Os seguintes endpoints serão gerados para cada tabela:

- `GET /api/{tableName}`: Obtém uma lista de todos os registros na tabela.
- `GET /api/{tableName}/{id}`: Obtém um registro específico na tabela pelo seu ID.
- `POST /api/{tableName}`: Cria um novo registro na tabela.
- `PUT /api/{tableName}/{id}`: Atualiza um registro específico na tabela pelo seu ID.
- `DELETE /api/{tableName}/{id}`: Deleta um registro específico na tabela pelo seu ID.

## Documentação OpenAPI

A documentação OpenAPI para a API gerada pode ser encontrada em `GET /documentation/json`. Esta documentação fornece detalhes sobre todos os endpoints, parâmetros de requisição e respostas da API.

## Saúde da API

Um endpoint de saúde da API está disponível em `GET /api/health`. Este endpoint retorna informações sobre a saúde da API, incluindo informações sobre o processo, o sistema operacional, a memória e o banco de dados.

## Contato

Se tiver alguma dúvida ou sugestão, sinta-se à vontade para entrar em contato.
