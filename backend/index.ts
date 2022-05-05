require("dotenv").config();
import Fastify, { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import fastifyPostgres from "@fastify/postgres";
import path from "path";
const fastify: FastifyInstance = Fastify({
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
fastify.register(require("./loginRoute"));
fastify.register(require("./homeRoute"));

const start = async () => {
	try {
		await fastify.listen(2005);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
