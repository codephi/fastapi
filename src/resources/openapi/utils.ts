import {
  OpenAPI,
  Operation,
  Schema,
  Response,
  Parameter
} from './openapiTypes';

function convertOpenAPItoSchemas(openAPI: OpenAPI): OpenAPI {
  const schemas: Schema = {};

  // Create the components object if it doesn't exist
  if (!openAPI.components) {
    openAPI.components = {};
  }

  // Create the schemas object inside components if it doesn't exist
  if (!openAPI.components.schemas) {
    openAPI.components.schemas = {};
  }

  // Iterate over the paths defined in OpenAPI
  for (const path in openAPI.paths) {
    const pathItem = openAPI.paths[path];

    for (const method in pathItem) {
      if (method !== 'parameters') {
        const operation = pathItem[method] as Operation;
        const { responses } = operation;

        for (const statusCode in responses) {
          const response = responses[statusCode];
          const { content } = response as Response;

          for (const contentType in content) {
            const mediaType = content[contentType];
            const schema = mediaType.schema;

            if (schema) {
              const schemaKey = JSON.stringify(schema);

              // Check if the schema has already been registered
              if (schemas[schemaKey]) {
                // Reuse the existing schema
                mediaType.schema = {
                  $ref: `#/components/schemas/${schemas[schemaKey]}`
                };
              } else {
                const schemaName = `${method.toUpperCase()}_${path.replace(
                  /\//g,
                  '_'
                )}_${statusCode}`;

                // Add the schema to the schemas object
                schemas[schemaKey] = schemaName;
                openAPI.components.schemas[schemaName] = schema;

                // Update the reference to the schema
                mediaType.schema = {
                  $ref: `#/components/schemas/${schemaName}`
                };
              }
            }
          }
        }

        // Check for undeclared path parameters
        const parameters = operation.parameters as Parameter[];
        const declaredPathParams = (path.match(/{\w+}/g) as string[]) || [];

        parameters.forEach((parameter) => {
          if (
            parameter.in === 'path' &&
            !declaredPathParams.includes(`{${parameter.name}}`)
          ) {
            console.warn(
              `Declared path parameter "${parameter.name}" needs to be defined as a path parameter at either the path or operation level`
            );
          }
        });
      }
    }
  }

  return openAPI;
}

function resolvePlural(resourceName: string): string {
  return resourceName.endsWith('s') ? resourceName : `${resourceName}s`;
}

export { convertOpenAPItoSchemas, resolvePlural };
