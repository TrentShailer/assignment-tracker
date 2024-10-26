docker build . -t trentshailer/assignment-tracker:latest
docker compose -p 'assignment-tracker' -f ./docker/docker-compose.yml up -d
