// Create new user
import { FastifyInstance, FastifySchema } from "fastify";
import * as argon2 from "argon2";
import {
  NOT_NULL_VIOLATION,
  UNIQUE_VIOLATION,
} from "../../../../utils/PGErrors";

interface Body {
  username: string;
  password: string;
}

const schema: FastifySchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string" },
      password: { type: "string" },
    },
  },
};

const ValidFields = (
  username: string,
  password: string
): true | "error.null" | "error.bounds" => {
  if (username === "") return "error.null";
  if (password === "") return "error.null";

  if (username.length < 0 || username.length > 256) return "error.bounds";
  if (password.length < 0 || password.length > 256) return "error.bounds";

  return true;
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>("/", { schema }, async (request, reply) => {
    try {
      const { username, password } = request.body;
      // Validate username and password
      const valid = ValidFields(username, password);
      if (valid !== true) return reply.send({ ok: false, reason: valid });

      // Hash password
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        secret: Buffer.from(fastify.config.HASH_SECRET),
      });

      // Try create user
      const { rows } = await fastify.pg.query<{ id: string }>(
        "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING id;",
        [username, passwordHash]
      );

      const user_id = rows[0].id;

      request.session.set("user_id", user_id);

      return reply
        .status(201)
        .send({ ok: true, user: { id: user_id, username } });
    } catch (error: any) {
      if (error.code === UNIQUE_VIOLATION)
        return reply.send({ ok: false, reason: "error.unique" });

      if (error.code === NOT_NULL_VIOLATION)
        return reply.send({ ok: false, reason: "error.null" });

      console.error(error);
      return reply.status(500).send();
    }
  });
}
