docker compose -p assignment-dev -f ./docker/docker-compose-test.yml down -v || exit 1
docker compose -p assignment-dev -f ./docker/docker-compose-test.yml up -d || exit 1
