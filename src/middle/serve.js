"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _fastify = /*#__PURE__*/ _interop_require_default(require("fastify"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const _default = ()=>{
    const api = (0, _fastify.default)({
        logger: true
    });
    api.register(require('@fastify/cors'), {
        origin: '*'
    });
    return api;
};
