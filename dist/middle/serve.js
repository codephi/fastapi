import fastify from "fastify";
export default function() {
    var api = fastify({
        logger: true
    });
    api.register(require("@fastify/cors"), {
        origin: "*"
    });
    return api;
};
