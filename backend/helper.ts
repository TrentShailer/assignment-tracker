import { FastifyInstance } from "fastify";

async function UserExists(fastify: FastifyInstance, user_id: string): Promise<boolean> {
	const client = await fastify.pg.connect();
	const userQuery = (
		await client.query<{ user_id: string }>("SELECT user_id FROM users WHERE user_id = $1;", [
			user_id,
		])
	).rowCount;
	client.release();
	if (userQuery === 0) return false;
	return true;
}

export { UserExists };
