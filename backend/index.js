require("dotenv").config();
const Fastify = require("fastify");
const fastifyStatic = require("@fastify/static");
const fastifySession = require("@fastify/session");
const fastifyCookie = require("@fastify/cookie");
const fastifyPostgres = require("@fastify/postgres");
const path = require("path");
const fastify = Fastify({
	logger: true,
});

fastify.register(fastifyCookie);

if (process.env.COOKIE_SECRET)
	fastify.register(fastifySession, {
		cookieName: "sessionId",
		secret: process.env.COOKIE_SECRET,
	});

fastify.register(fastifyPostgres, {
	connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
});

fastify.register(fastifyStatic, { root: path.join(__dirname, "build") });

fastify.register(require("./pageRoute"));

const start = async () => {
	try {
		await fastify.listen(2005);
		/*
		const client = await fastify.pg.connect();
		const someResult = (
			await client.query<{ user_id: string; username: string; password: string }>(
				"SELECT * FROM users WHERE username = $1;", [request.body.username]
			)
		).rows;
		client.release();
		*/
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
