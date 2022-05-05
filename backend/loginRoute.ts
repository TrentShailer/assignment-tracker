import { FastifyInstance } from "fastify";

async function loginRoutes(fastify: FastifyInstance, options: any) {
	fastify.post("/login", async (request, reply) => {});
}

export default loginRoutes;
