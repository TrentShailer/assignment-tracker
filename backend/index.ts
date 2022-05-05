import Fastify from "fastify";
import mainRoute from "./mainRoute";
import fastifyStatic from "@fastify/static";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import fastifyPostgres from "@fastify/postgres";
import "dotenv/config";
import path from "path";

const fastify = Fastify({
	logger: true,
});

fastify.register(fastifyCookie);
if (process.env.COOKIE_SECRET)
	fastify.register(fastifySession, { secret: process.env.COOKIE_SECRET });

fastify.register(fastifyPostgres, {
	connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
});

fastify.register(fastifyStatic, { root: path.join(__dirname, "build") });

fastify.register(mainRoute);

const start = async () => {
	try {
		await fastify.listen(2005);
		/* const client = await fastify.pg.connect();
		const someResult = (
			await client.query<{ user_id: string; username: string; password: string }>(
				"SELECT * FROM users;"
			)
		).rows; */
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
