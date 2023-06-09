export interface OpenAPI {
  openapi?: string;
  info?: Info;
  servers?: Server[];
  paths?: Paths;
  components?: Components;
  security?: SecurityRequirement[];
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
}

export interface Properties {
  [propertyName: string]: Schema | Reference;
}

export interface Schema {
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  type?: string;
  allOf?: (Schema | Reference)[];
  oneOf?: (Schema | Reference)[];
  anyOf?: (Schema | Reference)[];
  not?: Schema | Reference;
  items?: Schema | Reference;
  properties?: { [property: string]: Schema | Reference };
  additionalProperties?: boolean | Schema | Reference;
  description?: string;
  format?: string;
  default?: any;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: any;
  externalDocs?: ExternalDocumentation;
  deprecated?: boolean;
  xml?: XML;
  discriminator?: Discriminator;
  additionalItems?: Schema | Reference;
  patternProperties?: { [pattern: string]: Schema | Reference };
  contains?: Schema | Reference;
  propertyNames?: Schema | Reference;
  if?: Schema | Reference;
  then?: Schema | Reference;
  else?: Schema | Reference;
}

export interface XML {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
  defaultValue?: any;
}

export interface Discriminator {
  propertyName: string;
  mapping?: { [value: string]: string };
}

export interface Info {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: Contact;
  license?: License;
  version: string;
}

export interface Contact {
  name?: string;
  url?: string;
  email?: string;
}

export interface License {
  name: string;
  url?: string;
}

export interface Server {
  url: string;
  description?: string;
  variables?: { [variable: string]: ServerVariable };
}

export interface ServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface Paths {
  [path: string]: Path;
}

export interface Path {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  patch?: Operation;
  trace?: Operation;
  servers?: Server[];
  parameters?: (Parameter | Reference)[];
}

export interface Operation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  operationId?: string;
  parameters?: (Parameter | Reference)[];
  requestBody?: RequestBody | Reference;
  responses: Responses;
  callbacks?: { [callback: string]: Callback | Reference };
  deprecated?: boolean;
  security?: SecurityRequirement[];
  servers?: Server[];
  'x-admin'?: AdminInfo;
}

export interface AdminInfo {
  types: string[];
  groupName: string;
  resourceName: string;
  references?: AdminReferences;
}

export interface AdminReferences {
  list?: AdminReference;
  search?: AdminReference;
}

export interface AdminReference {
  query?: AdminReferenceQuery;
}

export interface AdminReferenceQuery {
  pageSize?: string;
  page?: string;
  order?: string;
  orderBy?: string;
  searchTerm: string;
}

export interface AdminReferenceSearch {
  [key: string]: string;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?:
    | 'matrix'
    | 'label'
    | 'form'
    | 'simple'
    | 'spaceDelimited'
    | 'pipeDelimited'
    | 'deep';
  explode?: boolean;
  allowReserved?: boolean;
  schema?: Schema | Reference;
  example?: any;
  examples?: { [example: string]: Example | Reference };
  content?: { [mediaType: string]: MediaType };
}

export interface RequestBody {
  description?: string;
  content: { [mediaType: string]: MediaType };
  required?: boolean;
}

export interface MediaType {
  schema?: Schema | Reference;
  example?: any;
  examples?: { [example: string]: Example | Reference };
  encoding?: { [property: string]: Encoding };
}

export interface Encoding {
  contentType?: string;
  headers?: { [header: string]: Header | Reference };
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

export interface Responses {
  [statusCode: number]: Response | Reference;
}

export interface Response {
  description: string;
  headers?: { [header: string]: Header | Reference };
  content?: { [mediaType: string]: MediaType };
  links?: { [link: string]: Link | Reference };
}

export interface Callback {
  [expression: string]: Path;
}

export interface Example {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export interface Link {
  operationRef?: string;
  operationId?: string;
  parameters?: { [parameter: string]: any };
  requestBody?: any;
  description?: string;
  server?: Server;
}

export interface Header {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: Schema | Reference;
  example?: any;
  examples?: { [example: string]: Example | Reference };
  content?: { [mediaType: string]: MediaType };
}

export interface Tag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
}

export interface Reference {
  $ref: string;
}

export interface Components {
  schemas?: { [schema: string]: Schema | Reference };
  responses?: { [response: string]: Response | Reference };
  parameters?: { [parameter: string]: Parameter | Reference };
  examples?: { [example: string]: Example | Reference };
  requestBodies?: {
    [requestBody: string]: RequestBody | Reference;
  };
  headers?: { [header: string]: Header | Reference };
  securitySchemes?: {
    [securityScheme: string]: SecurityScheme | Reference;
  };
  links?: { [link: string]: Link | Reference };
  callbacks?: { [callback: string]: Callback | Reference };
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: {
    implicit?: OAuthFlow;
    password?: OAuthFlow;
    clientCredentials?: OAuthFlow;
    authorizationCode?: OAuthFlow;
  };
  openIdConnectUrl?: string;
}

export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: { [scope: string]: string };
}

export interface SecurityRequirement {
  [name: string]: string[];
}

export interface ExternalDocumentation {
  description?: string;
  url: string;
}
