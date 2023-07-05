// Delete current user
import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.delete(
    "/",
    { preHandler: fastify.auth([fastify.verifySession]) },
    async (request, reply) => {
      try {
        const user = request.user;
        if (!user)
          throw { location: "DELETE /api/v1/user", message: "user undefined" };

        await fastify.pg.query("DELETE FROM users WHERE id = $1", [user.id]);
        request.session.delete();

        return reply.send({ ok: true });
      } catch (error: any) {
        console.error(error);
        return reply.status(500).send();
      }
    }
  );
}
