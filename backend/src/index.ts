import "./global";
import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import fastifyPostgres from "@fastify/postgres";
import fastifyAutoload from "@fastify/autoload";
import fastifyAuth from "@fastify/auth";
import fastifySecureSession from "@fastify/secure-session";
import path from "path";
import envSchema from "./utils/PluginConfig";

const fastify = Fastify({
  logger: true,
});

fastify
  .register(fastifyEnv, {
    confKey: "config",
    schema: envSchema,
  })
  .then(() => {
    fastify.register(fastifyAuth, { defaultRelation: "and" });

    fastify.register(fastifySecureSession, {
      sessionName: "session",
      cookieName: "session",
      key: Buffer.from(fastify.config.SESSION_KEY, "hex"),
      cookie: { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 14 },
    });

    fastify.register(fastifyPostgres, {
      database: fastify.config.POSTGRES_DATABASE,
      host: fastify.config.POSTGRES_HOST,
      port: fastify.config.POSTGRES_PORT,
      user: fastify.config.POSTGRES_USER,
      password: fastify.config.POSTGRES_PASSWORD,
    });

    fastify.decorate("verifySession", async (request, reply) => {
      const user_id = request.session.get("user_id");
      if (!user_id) return reply.status(401).send();

      const { rows } = await fastify.pg.query<{ username: string }>(
        "SELECT username FROM users WHERE id = $1;",
        [user_id]
      );
      if (rows.length === 0) return reply.status(401).send();

      request.user = {
        username: rows[0].username,
        id: user_id,
      };
    });

    fastify.decorate("verifyCourseAccess", async (request, reply) => {
      if (!request.user) return reply.status(401).send();

      const params: any = request.params;
      const course_id = params.course_id;
      if (!course_id) {
        console.error("Course ID not in params");
        return reply.status(500).send();
      }

      const { rows } = await fastify.pg.query<{ name: string }>(
        "SELECT name FROM courses WHERE id = $1 AND user_id = $2;",
        [course_id, request.user.id]
      );

      if (rows.length === 0) return reply.status(403).send();

      request.course = { id: course_id, name: rows[0].name };
    });

    fastify.decorate("verifyAssignmentAccess", async (request, reply) => {
      if (!request.user) return reply.status(401).send();

      const params: any = request.params;
      const assignment_id = params.assignment_id;
      if (!assignment_id) {
        console.error("Assignment ID not in params");
        return reply.status(500).send();
      }

      const { rows } = await fastify.pg.query<{
        name: string;
        out_date: Date;
        due_date: Date;
        progress: number;
        course_id: string;
      }>(
        "SELECT name, out_date, due_date, progress, course_id FROM assignments WHERE id = $1 AND user_id = $2;",
        [assignment_id, request.user.id]
      );

      if (rows.length === 0) return reply.status(403).send();

      request.assignment = { id: assignment_id, ...rows[0] };
    });

    fastify.register(fastifyAutoload, {
      dir: path.join(__dirname, "routes"),
      routeParams: true,
    });

    // Run the server!
    fastify.listen({ port: 8080, host: "0.0.0.0" }, async (err, address) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }

      console.log(`Server is now listening on ${address}`);
    });
  });
