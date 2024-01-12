create table if not exists "users" (
    "id"       UUID    primary key default gen_random_uuid(),
    "username" VARCHAR not null unique,
    "password" VARCHAR not null
);
create table if not exists "courses" (
    "id"      UUID    primary key default gen_random_uuid(),
    "user_id" UUID    not null references "users" ("id") on delete cascade,
    "name"    VARCHAR not null
);
create table if not exists "assignments" (
    "id"        UUID      primary key default gen_random_uuid(),
    "user_id"   UUID      not null references "users" ("id") on delete cascade,
    "course_id" UUID      not null references "courses" ("id") on delete cascade,
    "name"      VARCHAR   not null,
    "out_date"  TIMESTAMP not null,
    "due_date"  TIMESTAMP not null,
    "progress"  SMALLINT  not null
);
