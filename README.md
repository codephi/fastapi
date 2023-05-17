# FastAPI

FastAPI is a powerful library that simplifies the creation of RESTful APIs using Fastify and Sequelize. It allows you to define your database tables and API routes in a JSON file, making the development process faster and more efficient.

## Features

- **Database Generation**: Define your database structure in a JSON file and let FastAPI handle the rest. It supports various data types and constraints.

- **API Generation**: Create API endpoints quickly and easily, with support for all CRUD operations.

- **Custom Route Customization**: In addition to the automatically generated routes, you can define your own custom routes as needed.

- **Error Handling**: Integrated error handling, making it easier to deal with unexpected situations.

- **CORS Support**: Easily configure the CORS policies for your API.

## Getting Started

### Prerequisites

- Node.js
- A SQL database compatible with Sequelize

### Installation

```
   npm i codephi/fastapi
```

### Basic Usage

```javascript
const { FastAPI } = require('fastapi');

const fastapi = new FastAPI();

fastapi
  .setDataBase({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  })

fastapi.get(
  '/hello',
  {
    tags: ['hello'],
    summary: 'Hello world',
    description: 'Hello world',
    responses: {
      200: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  },
  async () => {
    return { message: 'Hello world' };
  }
);

fastapi.start();
```

## Contributing
Contributions are always welcome! Whether through pull requests, reporting bugs, or suggesting new features.

## License
MIT
