async function routes(fastify, options) {
	fastify.get("/", async (request, reply) => {
		if (request.session.user) {
			return reply.redirect(301, "/home");
		} else {
			return reply.redirect(301, "/login");
		}
	});

	fastify.get("/login", async (request, reply) => {
		if (request.session.user) return reply.redirect(301, "/home");

		return reply.sendFile("index.html");
	});

	fastify.get("/home", async (request, reply) => {
		if (!request.session.user) return reply.redirect(301, "/login");

		return reply.sendFile("index.html");
	});
}

module.exports = routes;
