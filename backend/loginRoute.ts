import { FastifyInstance } from "fastify";
import * as argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";

interface IBody {
	username: string;
	password: string;
}

async function loginRoutes(fastify: FastifyInstance, options: any) {
	fastify.post<{ Body: IBody }>("/login", async (request, reply) => {
		const client = await fastify.pg.connect();

		const userQuery = await client.query<{ user_id: string; password: string }>(
			"SELECT user_id, password FROM users WHERE username = $1;",
			[request.body.username]
		);

		client.release();
		if (userQuery.rowCount === 0) {
			return reply.send({ success: false });
		}

		let hashMatch = await argon2.verify(userQuery.rows[0].password, request.body.password);

		if (!hashMatch) {
			return reply.send({ success: false });
		}

		request.session.set("user_id", userQuery.rows[0].user_id);
		return reply.send({ success: true });
	});

	fastify.post<{ Body: IBody }>("/register", async (request, reply) => {
		const client = await fastify.pg.connect();

		let validUsername = IsUsernameValid(request.body.username);
		let validPassword = IsPasswordValid(request.body.password);

		if (!validUsername.valid) {
			return reply.send({ success: false, message: validUsername.reason });
		}

		if (!validPassword.valid) {
			return reply.send({ success: false, message: validPassword.reason });
		}

		const usernameExists = await client.query<{ user_id: string }>(
			"SELECT user_id FROM users WHERE username = $1;",
			[request.body.username]
		);

		if (usernameExists.rowCount > 0) {
			return reply.send({ success: false, message: "Username already exists." });
		}

		let hash = await argon2.hash(request.body.password, { type: argon2.argon2id });

		let user_id = uuidv4();

		const result = await client.query(
			"INSERT INTO users (user_id, username, password) VALUES ($1, $2, $3);",
			[user_id, request.body.username, hash]
		);

		client.release();

		request.session.set("user_id", user_id);

		return reply.send({ success: true });
	});
}

interface IValidity {
	valid: boolean;
	reason?: string;
}

function IsUsernameValid(username: string | undefined): IValidity {
	let validity: IValidity = { valid: true };

	if (!username || username === "") {
		validity = { valid: false, reason: "You must enter a username." };
		return validity;
	}

	if (username.length < 6) {
		validity = { valid: false, reason: "Username must be at least 6 characters long." };
		return validity;
	}

	if (username.length > 32) {
		validity = { valid: false, reason: "Username must be at most 32 characters long." };
		return validity;
	}

	if (username.match(/[^a-zA-Z0-9\`\~\!\@\#\$\%\^\&\*\-\_\=\+\ ]/)) {
		validity = {
			valid: false,
			reason: "Username may only contain letters, numbers, and certain special characters.",
		};
		return validity;
	}

	return validity;
}

function IsPasswordValid(password: string | undefined): IValidity {
	let validity: IValidity = { valid: true };

	if (!password || password === "") {
		validity = { valid: false, reason: "You must enter a password." };
		return validity;
	}

	if (password.length < 12) {
		validity = { valid: false, reason: "Password must be at least 12 characters long." };
		return validity;
	}

	if (password.length > 32) {
		validity = { valid: false, reason: "Password must be at most 32 characters long." };
		return validity;
	}

	if (password.match(/[^a-zA-Z0-9\`\~\!\@\#\$\%\^\&\*\-\_\=\+\ ]/)) {
		validity = {
			valid: false,
			reason: "Password may only contain letters, numbers, and certain special characters.",
		};
		return validity;
	}

	return validity;
}

export default loginRoutes;
