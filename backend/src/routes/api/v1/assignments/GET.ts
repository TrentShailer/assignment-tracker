// Get all assignments for user
import { FastifyInstance, FastifySchema } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/",
    { preHandler: [fastify.verifySession] },
    async (request, reply) => {
      try {
        if (!request.user)
          throw {
            location: "GET /api/v1/assignments",
            message: "user undefined",
          };

        const { rows } = await fastify.pg.query<{
          id: string;
          course_id: string;
          name: string;
          out_date: Date;
          due_date: Date;
          progress: number;
        }>(
          "SELECT id, course_id, name, out_date, due_date, progress FROM assignments WHERE user_id = $1;",
          [request.user.id]
        );

        return reply.send({ ok: true, assignments: rows });
      } catch (error: any) {
        console.error(error);
        return reply.status(500).send();
      }
    }
  );
}
