// Update an assignment
import { FastifyInstance, FastifySchema } from "fastify";
import {
  FOREIGN_KEY_VIOLATION,
  NOT_NULL_VIOLATION,
} from "../../../../../../../utils/PGErrors";

interface Body {
  name: string;
  out_date: Date;
  due_date: Date;
  progress: number;
}

const schema: FastifySchema = {
  body: {
    type: "object",
    required: ["name", "out_date", "due_date", "progress"],
    properties: {
      name: { type: "string" },
      out_date: { type: "string" },
      due_date: { type: "string" },
      progress: { type: "number" },
    },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.put<{ Body: Body }>(
    "/",
    {
      schema,
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
              "POST /api/v1/courses/_course_id/assignments/_assignment_id",
            message: "user undefined",
          };
        if (!request.course)
          throw {
            location:
              "POST /api/v1/courses/_course_id/assignments/_assignment_id",
            message: "course undefined",
          };
        if (!request.assignment)
          throw {
            location:
              "POST /api/v1/courses/_course_id/assignments/_assignment_id",
            message: "assignment undefined",
          };

        const { name, out_date, due_date, progress } = request.body;

        if (name === "" || progress < 0 || progress > 100)
          return reply.send({ ok: false, reason: "error.null" });

        const outDate = new Date(out_date);
        const dueDate = new Date(due_date);

        const { rowCount, rows } = await fastify.pg.query<{
          id: string;
          course_id: string;
          name: string;
          out_date: Date;
          due_date: Date;
          progress: number;
        }>(
          "UPDATE assignments SET name = $4, out_date = $5, due_date = $6, progress = $7 WHERE id = $1 AND user_id = $2 AND course_id = $3 RETURNING id, course_id, name, out_date, due_date, progress;",
          [
            request.assignment.id,
            request.user.id,
            request.course.id,
            name,
            outDate,
            dueDate,
            progress,
          ]
        );
        if (rowCount === 0)
          return reply.send({ ok: false, reason: "error.not_found" });

        return reply.send({
          ok: true,
          assignment: {
            ...rows[0],
          },
        });
      } catch (error: any) {
        if (error.code === FOREIGN_KEY_VIOLATION)
          return reply.send({ ok: false, reason: "error.fk" });

        if (error.code === NOT_NULL_VIOLATION)
          return reply.send({ ok: false, reason: "error.null" });
        console.error(error);
        return reply.status(500).send();
      }
    }
  );
}
