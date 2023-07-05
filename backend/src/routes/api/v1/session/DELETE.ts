// Logout
import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.delete("/", async (request, reply) => {
    try {
      request.session.delete();
      return reply.send({ ok: true });
    } catch (error: any) {
      console.error(error);
      return reply.status(500).send();
    }
  });
}
