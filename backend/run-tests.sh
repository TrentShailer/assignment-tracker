docker compose -p assignment-test -f ./docker/docker-compose-test.yml down -v || exit 1
docker compose -p assignment-test -f ./docker/docker-compose-test.yml up -d || exit 1
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"
cargo test --locked || exit 1
docker compose -p assignment-test -f ./docker/docker-compose-test.yml down -v || exit 1
