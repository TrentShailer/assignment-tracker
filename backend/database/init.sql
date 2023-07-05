CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" VARCHAR NOT NULL UNIQUE,
  "password" VARCHAR NOT NULL
);
CREATE TABLE IF NOT EXISTS "courses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR NOT NULL
);
CREATE TABLE IF NOT EXISTS "assignments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "course_id" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "name" VARCHAR NOT NULL,
  "out_date" TIMESTAMP NOT NULL,
  "due_date" TIMESTAMP NOT NULL,
  "progress" SMALLINT NOT NULL
);