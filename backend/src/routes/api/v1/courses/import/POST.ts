// Create a new course for current user
import { FastifyInstance, FastifySchema } from "fastify";
import {
  FOREIGN_KEY_VIOLATION,
  NOT_NULL_VIOLATION,
} from "../../../../../utils/PGErrors";

interface Body {
  course_id: string;
}

const schema: FastifySchema = {
  body: {
    type: "object",
    required: ["course_id"],
    properties: {
      course_id: { type: "string" },
    },
  },
};

const GetCourseName = async (
  course_id: string,
  fastify: FastifyInstance
): Promise<string | "error.not_found" | "error.server"> => {
  try {
    const { rows } = await fastify.pg.query<{ name: string }>(
      "SELECT name FROM courses WHERE id = $1;",
      [course_id]
    );
    if (rows.length === 0) return "error.not_found";

    return rows[0].name;
  } catch (error) {
    console.error(error);
    return "error.server";
  }
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>(
    "/",
    { schema, preHandler: [fastify.verifySession] },
    async (request, reply) => {
      try {
        if (!request.user)
          throw {
            location: "POST /api/v1/courses/import",
            message: "user undefined",
          };
        const { course_id } = request.body;

        // Fetch the course (course name)
        const courseName = await GetCourseName(course_id, fastify);
        if (courseName === "error.not_found" || courseName === "error.server") {
          // If not exists throw a not ok error
          return reply.status(200).send({ ok: false, reason: courseName });
        }
        // Duplicate course
        const { rows } = await fastify.pg.query<{ id: string }>(
          "INSERT INTO courses(name, user_id) VALUES ($1, $2) RETURNING id;",
          [courseName, request.user.id]
        );
        if (rows.length === 0)
          throw {
            location: "POST /api/v1/courses/import",
            message: "Insert returned no rows",
          };

        // duplicate assignments

        await fastify.pg.query(
          `
				INSERT INTO assignments(user_id, course_id, name, out_date, due_date, progress)
				SELECT $1 as user_id, $2 as course_id, name, out_date, due_date, 0 as progress
				FROM assignments
				WHERE course_id = $3;
				`,
          [request.user.id, rows[0].id, course_id]
        );

        return reply.status(201).send({ ok: true });
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
