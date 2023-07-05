// Login
import { FastifyInstance, FastifySchema } from "fastify";
import * as argon2 from "argon2";

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

      // Try find the user
      const { rows } = await fastify.pg.query<{ id: string; password: string }>(
        "SELECT id, password FROM users WHERE username = $1;",
        [username]
      );
      if (rows.length === 0)
        return reply.send({ ok: false, reason: "error.username_password" });

      const { id, password: hash } = rows[0];

      // Check if password matches
      const passwordMatch = await argon2.verify(hash, password, {
        secret: Buffer.from(fastify.config.HASH_SECRET),
      });

      if (!passwordMatch)
        return reply.send({ ok: false, reason: "error.username_password" });

      request.session.set("user_id", id);
      return reply.status(201).send({ ok: true, user: { id, username } });
    } catch (error: any) {
      console.error(error);
      return reply.status(500).send();
    }
  });
}
