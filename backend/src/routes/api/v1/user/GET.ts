// Get user_id and username for current user
import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/",
    { preHandler: fastify.auth([fastify.verifySession]) },
    async (request, reply) => {
      try {
        const user = request.user;
        if (!user)
          throw { location: "GET /api/v1/user", message: "user undefined" };

        return reply.send({
          ok: true,
          user,
        });
      } catch (error: any) {
        console.error(error);
        return reply.status(500).send();
      }
    }
  );
}
