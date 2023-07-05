// Update a course
import { FastifyInstance, FastifySchema } from "fastify";
import { NOT_NULL_VIOLATION } from "../../../../../utils/PGErrors";

interface Body {
  name: string;
}

const schema: FastifySchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
    },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.put<{ Body: Body }>(
    "/",
    { schema, preHandler: [fastify.verifySession, fastify.verifyCourseAccess] },
    async (request, reply) => {
      try {
        if (!request.user)
          throw {
            location: "PUT /api/v1/courses/_course_id",
            message: "user undefined",
          };
        if (!request.course)
          throw {
            location: "PUT /api/v1/courses/_course_id",
            message: "course undefined",
          };

        const { name } = request.body;

        if (name === "") return reply.send({ ok: false, reason: "error.null" });

        const { rowCount } = await fastify.pg.query(
          "UPDATE courses SET name = $1 WHERE id = $2 AND user_id = $3;",
          [name, request.course.id, request.user.id]
        );
        if (rowCount === 0)
          return reply.send({ ok: false, reason: "error.not_found" });

        return reply.send({
          ok: true,
          course: { id: request.course.id, name },
        });
      } catch (error: any) {
        if (error.code === NOT_NULL_VIOLATION)
          return reply.send({ ok: false, reason: "error.null" });
        console.error(error);
        return reply.status(500).send();
      }
    }
  );
}
