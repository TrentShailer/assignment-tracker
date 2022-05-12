import { FastifyInstance } from "fastify";
import { v4 } from "uuid";

interface IAssignmentDelete {
	assignment_id: string;
}

interface IAssignmentUpdate {
	assignment_id: string;
	assignment_name: string;
	notes: string;
	progress: number;
	outDate: Date;
	dueDate: Date;
}
interface IAssignmentNew {
	course_id: string;
	assignment_name: string;
}

interface ICourseDelete {
	course_id: string;
}

interface ICourseNew {
	course_name: string;
}

interface ICourseUpdate {
	course_id: string;
	course_name: string;
}

async function homeRoutes(fastify: FastifyInstance, options: any) {
	fastify.post<{ Body: IAssignmentDelete }>("/assignment/delete", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const existsQuery = await client.query<{ assignment_id: string }>(
				"SELECT assignment_id FROM assignment WHERE assignment_id = $1 AND user_id = $2;",
				[request.body.assignment_id, user_id]
			);

			if (existsQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			await client.query("DELETE FROM assignment WHERE assignment_id = $1;", [
				request.body.assignment_id,
			]);

			client.release();

			return reply.send(200);
		} else {
			return reply.send(403);
		}
	});

	fastify.post<{ Body: IAssignmentUpdate }>("/assignment/update", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const existsQuery = await client.query<{ assignment_id: string }>(
				"SELECT assignment_id FROM assignment WHERE assignment_id = $1 AND user_id = $2;",
				[request.body.assignment_id, user_id]
			);

			if (existsQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			await client.query(
				"UPDATE assignment SET assignment_name = $1, notes = $2, progress = $3, out_date = $4, due_date = $5 WHERE assignment_id = $6;",
				[
					request.body.assignment_name,
					request.body.notes,
					request.body.progress,
					request.body.outDate,
					request.body.dueDate,
					request.body.assignment_id,
				]
			);

			client.release();

			return reply.send(200);
		} else {
			return reply.send(403);
		}
	});

	fastify.post<{ Body: IAssignmentNew }>("/assignment/new", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const existsQuery = await client.query<{ assignment_id: string }>(
				"SELECT course_id FROM course WHERE course_id = $1 AND user_id = $2;",
				[request.body.course_id, user_id]
			);

			if (existsQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			await client.query(
				"INSERT INTO assignment (assignment_id, course_id, assignment_name, user_id) VALUES ($1, $2, $3, $4);",
				[v4(), request.body.course_id, request.body.assignment_name, user_id]
			);

			client.release();

			return reply.send(200);
		} else {
			return reply.send(403);
		}
	});
	fastify.post<{ Body: ICourseUpdate }>("/course/update", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const existsQuery = await client.query<{ assignment_id: string }>(
				"SELECT course_id FROM course WHERE course_id = $1 AND user_id = $2;",
				[request.body.course_id, user_id]
			);

			if (existsQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			await client.query("UPDATE course SET course_name = $1 WHERE course_id = $2;", [
				request.body.course_name,
				request.body.course_id,
			]);

			client.release();

			return reply.send(200);
		} else {
			return reply.send(403);
		}
	});
	fastify.post<{ Body: ICourseNew }>("/course/new", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const existsQuery = await client.query<{ assignment_id: string }>(
				"SELECT user_id FROM users WHERE user_id = $1;",
				[user_id]
			);

			if (existsQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			await client.query(
				"INSERT INTO course (course_id, course_name, user_id) VALUES ($1, $2, $3);",
				[v4(), request.body.course_name, user_id]
			);

			client.release();

			return reply.send(200);
		} else {
			return reply.send(403);
		}
	});

	fastify.post<{ Body: ICourseDelete }>("/course/delete", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const existsQuery = await client.query<{ course_id: string }>(
				"SELECT course_id FROM course WHERE course_id = $1 AND user_id = $2;",
				[request.body.course_id, user_id]
			);

			if (existsQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			await client.query("DELETE FROM course WHERE course_id = $1;", [
				request.body.course_id,
			]);

			client.release();

			return reply.send(200);
		} else {
			return reply.send(403);
		}
	});

	fastify.get("/username", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const usernameQuery = await client.query<{ username: string }>(
				"SELECT username FROM users WHERE user_id = $1;",
				[user_id]
			);

			if (usernameQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			client.release();
			return reply.send({ username: usernameQuery.rows[0].username });
		} else {
			return reply.send(403);
		}
	});

	fastify.delete("/account", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const usernameQuery = await client.query<{ username: string }>(
				"SELECT username FROM users WHERE user_id = $1;",
				[user_id]
			);

			if (usernameQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			await client.query("DELETE FROM users WHERE user_id = $1;", [user_id]);

			return reply.send({ success: true });
		} else {
			return reply.send(403);
		}
	});

	fastify.get("/assignments", async (request, reply) => {
		if (request.session.get("user_id")) {
			let user_id: string = request.session.get("user_id");
			const client = await fastify.pg.connect();

			const existsQuery = await client.query<{ user_id: string }>(
				"SELECT user_id FROM users WHERE user_id = $1;",
				[user_id]
			);

			if (existsQuery.rowCount === 0) {
				client.release();
				return reply.send(404);
			}

			let courses: Course[] = [];

			const courseQuery = await client.query<{ course_id: string; course_name: string }>(
				"SELECT course_id, course_name FROM course WHERE user_id = $1;",
				[user_id]
			);

			for (let i = 0; i < courseQuery.rowCount; i++) {
				let course = courseQuery.rows[i];
				courses.push({
					course_id: course.course_id,
					course_name: course.course_name,
					assignments: [],
				});

				const assignmentQuery = await client.query<{
					assignment_id: string;
					assignment_name: string;
					notes: string;
					progress: number;
					out_date: Date;
					due_date: Date;
				}>(
					"SELECT assignment_id, assignment_name, notes, progress, out_date, due_date FROM assignment WHERE course_id = $1;",
					[course.course_id]
				);

				for (let j = 0; j < assignmentQuery.rowCount; j++) {
					let assignment = assignmentQuery.rows[j];
					courses[i].assignments.push({
						assignment_id: assignment.assignment_id,
						assignment_name: assignment.assignment_name,
						notes: assignment.notes,
						progress: assignment.progress,
						dueDate: assignment.due_date,
						outDate: assignment.out_date,
					});
				}
			}

			client.release();

			return reply.send({ courses: courses });
		} else {
			return reply.send(403);
		}
	});
}

interface Assignment {
	assignment_id: string;
	assignment_name: string;
	outDate: Date;
	dueDate: Date;
	notes: string;
	progress: number;
}

interface Course {
	course_id: string;
	course_name: string;
	assignments: Assignment[];
}

export default homeRoutes;
