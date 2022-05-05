CREATE TABLE users (
	user_id UUID PRIMARY KEY NOT NULL,
	username VARCHAR UNIQUE NOT NULL,
	password VARCHAR NOT NULL
);
CREATE INDEX user_username on users(username);
--
--
--
CREATE TABLE course (
	course_id UUID PRIMARY KEY NOT NULL,
	course_name VARCHAR NOT NULL,
	user_id UUID NOT NULL,
	CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX course_user_id on course(user_id);
--
--
--
CREATE TABLE assignment (
	assignment_id UUID PRIMARY KEY NOT NULL,
	assignment_name VARCHAR NOT NULL,
	out_date TIMESTAMP,
	due_date TIMESTAMP,
	notes VARCHAR,
	progress INTEGER DEFAULT 0,
	course_id UUID NOT NULL,
	CONSTRAINT fk_course_id FOREIGN KEY(course_id) REFERENCES course(course_id) ON DELETE CASCADE
);
CREATE INDEX assignment_course_id on assignment(course_id);
