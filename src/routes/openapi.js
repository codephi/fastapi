function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
import { createFullDoc } from "../resources/openapi/doc";
import { RoutesBuilder } from "../resources/routes";
export default function builderOpeapi(paths) {
    var doc = createFullDoc(paths);
    var openapiSchema = objectToJSONSchema7(doc);
    var route = new RoutesBuilder("openapi");
    var openapi = route.path("/openapi.json").get({
        tags: [
            "Documentation"
        ],
        summary: "Get OpenAPI JSON",
        description: "Get OpenAPI JSON",
        responses: route.responses(200, openapiSchema.properties),
        handler: function(_request, reply) {
            reply.send(doc);
        }
    }).build();
    return openapi;
}
export function objectToJSONSchema7(json) {
    if (json === null || Array.isArray(json) || typeof json !== "object") {
        if (typeof json === "number") {
            return {
                type: "number"
            };
        } else if ((typeof json === "undefined" ? "undefined" : _type_of(json)) === "bigint") {
            return {
                type: "string"
            };
        } else if (typeof json === "boolean") {
            return {
                type: "boolean"
            };
        } else if (typeof json === "string") {
            return {
                type: "string"
            };
        } else if (typeof json === "object" && json === null) {
            return {
                type: "null"
            };
        } else if (typeof json === "object" && Array.isArray(json)) {
            return resolveArray(json.map(function(item) {
                return objectToJSONSchema7(item);
            }));
        } else if (typeof json === "object" && json !== null) {
            return objectToJSONSchema7(json);
        }
    }
    var schema = {
        type: "object",
        properties: {}
    };
    for(var key in json){
        var value = json[key];
        var valueType = typeof value === "undefined" ? "undefined" : _type_of(value);
        if (valueType === "number") {
            schema.properties[key] = {
                type: "number"
            };
        } else if (valueType === "bigint") {
            schema.properties[key] = {
                type: "string"
            };
        } else if (valueType === "boolean") {
            schema.properties[key] = {
                type: "boolean"
            };
        } else if (valueType === "string") {
            schema.properties[key] = {
                type: "string"
            };
        } else if (valueType === "object" && value === null) {
            schema.properties[key] = {
                type: "null"
            };
        } else if (valueType === "object" && Array.isArray(value)) {
            var items = resolveArray(value.map(function(item) {
                return objectToJSONSchema7(item);
            }));
            schema.properties[key] = {
                type: "array",
                items: items
            };
        } else if (valueType === "object" && value !== null) {
            schema.properties[key] = objectToJSONSchema7(value);
        }
    }
    return schema;
}
//Verificar se os itens do array são do mesmo tipo, se forem, retorna um dos items, se não, retorna o array
function resolveArray(item) {
    if (item.length === 1) {
        return item[0];
    }
    var firstItem = item[0];
    var sameType = item.every(function(i) {
        return i.type === firstItem.type;
    });
    if (sameType) {
        return firstItem;
    }
    return item;
}
