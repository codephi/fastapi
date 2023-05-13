const supertest = require('supertest')
const { openapiToJsonSchema } = require('openapi-jsonschema-validation')
const fs = require('fs')

const api = supertest(process.env.APP_URL) // Substitua <URL_DA_API> pela URL da sua API

// Carrega o arquivo JSON OpenAPI 3.0
const openapi = JSON.parse(fs.readFileSync('<CAMINHO_DO_ARQUIVO_JSON>')) // Substitua <CAMINHO_DO_ARQUIVO_JSON> pelo caminho do seu arquivo JSON OpenAPI

// Converte as definições de esquema JSON do OpenAPI para JSON Schema
const jsonSchema = openapiToJsonSchema(openapi)

// Função para validar o corpo da resposta com base no esquema JSON
function validarResposta (response, esquema) {
  const { body } = response
  const { error } = esquema.validate(body)
  if (error) {
    throw new Error(`Falha na validação da resposta: ${error.message}`)
  }
}

// Função para executar os testes de contrato
async function executarTestesDeContrato () {
  try {
    // Itera sobre as rotas definidas no JSON OpenAPI
    for (const path in openapi.paths) {
      const pathItem = openapi.paths[path]
      for (const method in pathItem) {
        if (method !== 'parameters') {
          const { operationId } = pathItem[method]

          // Obtém o esquema JSON para a rota atual
          const esquema = jsonSchema.components.schemas[operationId]

          // Faz a chamada à rota da API
          const response = await api[method](path).expect(200)

          // Valida a resposta com base no esquema JSON
          validarResposta(response, esquema)

          console.log(
            `Teste de contrato para ${method.toUpperCase()} ${path} passou.`
          )
        }
      }
    }

    console.log('Todos os testes de contrato passaram com sucesso!')
  } catch (error) {
    console.error('Erro durante a execução dos testes de contrato:', error)
  }
}

// Executa os testes de contrato
executarTestesDeContrato()
