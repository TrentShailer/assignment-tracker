require("dotenv").config();
import Fastify, { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import fastifyPostgres from "@fastify/postgres";
import fastifyCors from "@fastify/cors";
import path from "path";

// @ts-ignore
const fastify: FastifyInstance = Fastify({
	logger: {
		prettyPrint: {
			translateTime: "dd/mm/yyyy HH:MM:ss",
			ignore: "pid,hostname",
		},
		// @ts-ignore
		redact: ["body.password"],
		serializers: {
			res(reply) {
				return {
					statusCode: reply.statusCode,
				};
			},
			req(request) {
				return {
					method: request.method,
					url: request.url,
					session: request.session,
				};
			},
		},
	},
});

fastify.addHook("preHandler", function (req, reply, done) {
	if (req.body) {
		req.log.info({ body: req.body }, "parsed body");
	}
	done();
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

fastify.register(fastifyCors, {
	origin: (origin, cb) => {
		const hostname = new URL(origin).hostname;
		if (hostname === "localhost") {
			//  Request from localhost will pass
			cb(null, true);
			return;
		}
		// Generate an error on other origins, disabling access
		cb(new Error("Not allowed"), false);
	},
});

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
