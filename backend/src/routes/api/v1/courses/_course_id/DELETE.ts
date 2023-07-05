// Delete a course
import { FastifyInstance, FastifySchema } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.delete(
    "/",
    { preHandler: [fastify.verifySession, fastify.verifyCourseAccess] },
    async (request, reply) => {
      try {
        if (!request.user)
          throw {
            location: "DELETE /api/v1/courses/_course_id",
            message: "user undefined",
          };
        if (!request.course)
          throw {
            location: "DELETE /api/v1/courses/_course_id",
            message: "course undefined",
          };

        const { rowCount } = await fastify.pg.query(
          "DELETE FROM courses WHERE id = $1 AND user_id = $2;",
          [request.course.id, request.user.id]
        );
        if (rowCount === 0)
          return reply.send({ ok: false, reason: "error.not_found" });

        return reply.send({
          ok: true,
        });
      } catch (error: any) {
        console.error(error);
        return reply.status(500).send();
      }
    }
  );
}
