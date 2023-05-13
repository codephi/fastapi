function convertOpenAPItoSchemas (openAPI) {
  const schemas = {}

  // Cria o objeto components se não existir
  if (!openAPI.components) {
    openAPI.components = {}
  }

  // Cria o objeto schemas dentro de components se não existir
  if (!openAPI.components.schemas) {
    openAPI.components.schemas = {}
  }

  // Percorre os caminhos definidos no OpenAPI
  for (const path in openAPI.paths) {
    const pathItem = openAPI.paths[path]

    for (const method in pathItem) {
      if (method !== 'parameters') {
        const operation = pathItem[method]
        const { responses } = operation

        for (const statusCode in responses) {
          const response = responses[statusCode]
          const { content } = response

          for (const contentType in content) {
            const mediaType = content[contentType]
            const schema = mediaType.schema

            if (schema) {
              const schemaKey = JSON.stringify(schema)

              // Verifica se o esquema já foi registrado
              if (schemas[schemaKey]) {
                // Reutiliza o esquema existente
                mediaType.schema = {
                  $ref: `#/components/schemas/${schemas[schemaKey]}`
                }
              } else {
                const schemaName = `${method.toUpperCase()}_${path.replace(
                  /\//g,
                  '_'
                )}_${statusCode}`

                // Adiciona o esquema ao objeto schemas
                schemas[schemaKey] = schemaName
                openAPI.components.schemas[schemaName] = schema

                // Atualiza a referência ao esquema
                mediaType.schema = {
                  $ref: `#/components/schemas/${schemaName}`
                }
              }
            }
          }
        }

        // Verifica se há parâmetros de caminho não declarados
        const parameters = operation.parameters || []
        const pathParams = parameters.filter(
          (parameter) => parameter.in === 'path'
        )
        const declaredPathParams = path.match(/{\w+}/g) || []

        pathParams.forEach((parameter) => {
          if (!declaredPathParams.includes(`{${parameter.name}}`)) {
            console.warn(
              `Declared path parameter "${parameter.name}" needs to be defined as a path parameter at either the path or operation level`
            )
          }
        })
      }
    }
  }

  return openAPI
}

module.exports = {
  convertOpenAPItoSchemas
}
