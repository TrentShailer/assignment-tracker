import { FastifyInstance } from "fastify";
import * as argon2 from "argon2";

interface IBody {
	username: string;
	password: string;
}

async function loginRoutes(fastify: FastifyInstance, options: any) {
	fastify.post<{ Body: IBody }>("/login", async (request, reply) => {
		let hash: string = await argon2.hash(request.body.password, { type: argon2.argon2id });

		const client = await fastify.pg.connect();
		const credentialQuery = await client.query<{ user_id: string }>(
			"SELECT user_id FROM users WHERE username = $1 AND password = $2;",
			[request.body.username, hash]
		);
		client.release();

		if (credentialQuery.rowCount === 0) {
			return reply.send({ success: false });
		} else {
			request.session.set("user_id", credentialQuery.rows[0].user_id);
			return reply.send({ success: true });
		}
	});
}

export default loginRoutes;
