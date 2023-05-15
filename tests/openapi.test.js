if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const supertest = require('supertest');
const { expect } = require('chai');

const api = supertest('http://localhost:3000'); // substitua pela URL da sua API
const openApiDocument = require('./path/to/openapi.json'); // substitua pelo caminho do seu documento OpenAPI

// Função para recuperar as rotas definidas no documento OpenAPI
function getRoutesFromOpenAPI(openApiDoc) {
  const paths = openApiDoc.paths;
  const routes = [];

  for (const path in paths) {
    const methods = paths[path];
    for (const method in methods) {
      routes.push({ path, method });
    }
  }

  return routes;
}

describe('Testes de contrato da API', () => {
  const routes = getRoutesFromOpenAPI(openApiDocument);

  routes.forEach(({ path, method }) => {
    it(`Deve retornar 200 para ${method.toUpperCase()} ${path}`, async () => {
      const response = await api[method](path);
      expect(response.status).to.equal(200);
    });
  });
});
