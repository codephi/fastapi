const supertest = require('supertest')

function validateResponse (response, schema) {
  const { body } = response
  const { error } = schema.validate(body)
  if (error) {
    throw new Error(`Falha na validação da resposta: ${error.message}`)
  }
}

module.exports = (jsonSchema) => {
  return {
    paths: {
      '/testes-de-contrato': {
        get: {
          tags: ['Contrato'],
          summary: 'Executar testes de contrato',
          description:
            'Executa os testes de contrato definidos no JSON jsonSchema',
          responses: {
            200: {
              description: 'Testes de contrato executados com sucesso',
              content: {
                'text/plain': {
                  schema: {
                    type: 'string'
                  }
                }
              }
            },
            500: {
              description: 'Erro durante a execução dos testes de contrato',
              content: {
                'text/plain': {
                  schema: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    },
    handler: async (_request, reply) => {
      try {
        // Itera sobre as rotas definidas no JSON jsonSchema
        for (const path in jsonSchema.paths) {
          const pathItem = jsonSchema.paths[path]
          for (const method in pathItem) {
            if (method !== 'parameters') {
              const { operationId } = pathItem[method]

              // Obtém o esquema JSON para a rota atual
              const schema = jsonSchema.components.schemas[operationId]

              // Faz a chamada à rota da API
              const response = await supertest[method](path).expect(200)

              // Valida a resposta com base no esquema JSON
              validateResponse(response, schema)

              console.log(
                `Teste de contrato para ${method.toUpperCase()} ${path} passou.`
              )
            }
          }
        }

        reply
          .code(200)
          .send('Todos os testes de contrato passaram com sucesso!')
      } catch (error) {
        console.error('Erro durante a execução dos testes de contrato:', error)
        reply.code(500).send('Erro durante a execução dos testes de contrato')
      }
    }
  }
}
