// Create a new course for current user
import { FastifyInstance, FastifySchema } from "fastify";
import {
  FOREIGN_KEY_VIOLATION,
  NOT_NULL_VIOLATION,
} from "../../../../utils/PGErrors";

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
  fastify.post<{ Body: Body }>(
    "/",
    { schema, preHandler: [fastify.verifySession] },
    async (request, reply) => {
      try {
        if (!request.user)
          throw { location: "POST /api/v1/courses", message: "user undefined" };
        const { name } = request.body;

        if (name === "") return reply.send({ ok: false, reason: "error.null" });

        const { rows } = await fastify.pg.query<{ id: string }>(
          "INSERT INTO courses(user_id, name) VALUES($1, $2) RETURNING id;",
          [request.user.id, name]
        );
        if (rows.length === 0)
          throw {
            location: "POST /api/v1/courses",
            message: "Insert returned no rows",
          };

        return reply
          .status(201)
          .send({ ok: true, course: { id: rows[0].id, name } });
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
