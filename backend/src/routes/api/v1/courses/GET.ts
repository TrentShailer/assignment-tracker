// Get all courses for current user
import { FastifyInstance, FastifySchema } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/",
    { preHandler: [fastify.verifySession] },
    async (request, reply) => {
      try {
        if (!request.user)
          throw { location: "GET /api/v1/courses", message: "user undefined" };

        const { rows } = await fastify.pg.query<{ id: string; name: string }>(
          "SELECT id, name FROM courses WHERE user_id = $1;",
          [request.user.id]
        );

        return reply.send({ ok: true, courses: rows });
      } catch (error: any) {
        console.error(error);
        return reply.status(500).send();
      }
    }
  );
}
