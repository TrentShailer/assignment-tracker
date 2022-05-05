import { FastifyInstance } from "fastify";

async function routes(fastify: FastifyInstance, options: any) {
	fastify.get("/", async (request, reply) => {
		return reply.sendFile("index.html");
	});
}

export default routes;
