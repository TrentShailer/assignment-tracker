// Delete an assignment
import { FastifyInstance, FastifySchema } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.delete(
    "/",
    {
      preHandler: [
        fastify.verifySession,
        fastify.verifyCourseAccess,
        fastify.verifyAssignmentAccess,
      ],
    },
    async (request, reply) => {
      try {
        if (!request.user)
          throw {
            location:
              "DELETE /api/v1/courses/_course_id/assignments/_assignment_id",
            message: "user undefined",
          };
        if (!request.course)
          throw {
            location:
              "DELETE /api/v1/courses/_course_id/assignments/_assignment_id",
            message: "course undefined",
          };
        if (!request.assignment)
          throw {
            location:
              "DELETE /api/v1/courses/_course_id/assignments/_assignment_id",
            message: "assignment undefined",
          };

        const { rowCount } = await fastify.pg.query(
          "DELETE FROM assignments WHERE id = $1 AND user_id = $2 AND course_id = $3;",
          [request.assignment.id, request.user.id, request.course.id]
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
