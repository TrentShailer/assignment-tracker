import { FastifyInstance } from "fastify";

async function homeRoutes(fastify: FastifyInstance, options: any) {
	fastify.post("/get", async (request, reply) => {});
}

export default homeRoutes;
