// Create an assignment
import { FastifyInstance, FastifySchema } from "fastify";
import {
  FOREIGN_KEY_VIOLATION,
  NOT_NULL_VIOLATION,
} from "../../../../../../utils/PGErrors";

interface Body {
  name: string;
  out_date: string;
  due_date: string;
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
  fastify.post<{ Body: Body }>(
    "/",
    { schema, preHandler: [fastify.verifySession, fastify.verifyCourseAccess] },
    async (request, reply) => {
      try {
        if (!request.user)
          throw {
            location: "POST /api/v1/courses/_course_id/assignments",
            message: "user undefined",
          };
        if (!request.course)
          throw {
            location: "POST /api/v1/courses/_course_id/assignments",
            message: "course undefined",
          };
        const { name, out_date, due_date, progress } = request.body;

        if (name === "" || progress < 0 || progress > 100)
          return reply.send({ ok: false, reason: "error.null" });

        const outDate = new Date(out_date);
        const dueDate = new Date(due_date);

        const { rows } = await fastify.pg.query<{
          id: string;
          course_id: string;
          name: string;
          out_date: Date;
          due_date: Date;
          progress: number;
        }>(
          "INSERT INTO assignments(user_id, course_id, name, out_date, due_date, progress) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, course_id, name, out_date, due_date, progress;",
          [request.user.id, request.course.id, name, outDate, dueDate, progress]
        );
        if (rows.length === 0)
          throw {
            location: "POST /api/v1/courses/_course_id/assignments",
            message: "Insert returned no rows",
          };

        return reply.status(201).send({
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
