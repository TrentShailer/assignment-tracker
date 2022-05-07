import { FastifyInstance } from "fastify";
import { UserExists } from "./helper";

async function routes(fastify: FastifyInstance, options: any) {
	fastify.get("/", async (request, reply) => {
		const user_id = request.session.get<string>("user_id");

		if (user_id) {
			return reply.redirect(302, "/home");
		} else {
			return reply.redirect(302, "/login");
		}
	});

	fastify.get("/login", async (request, reply) => {
		const user_id = request.session.get<string>("user_id");
		if (user_id) return reply.redirect(302, "/home");

		return reply.sendFile("index.html");
	});

	fastify.get("/home", async (request, reply) => {
		const user_id = request.session.get<string>("user_id");

		if (!user_id) return reply.redirect(302, "/login");

		if (await UserExists(fastify, user_id)) {
			return reply.sendFile("index.html");
		} else {
			request.session.set("user_id", null);
			return reply.redirect(302, "/login");
		}
	});

	fastify.get("/logout", async (request, reply) => {
		request.session.set("user_id", null);

		return reply.redirect(302, "/login");
	});
}

export default routes;
