# cargo build --locked --release
# chmod u+rwx ./target/release/backups-client
# mv ./target/release/backups-client ./live/client/backups-client
# cd ./live/client
# nohup ./backups-client &>/dev/null &
docker build . -t trentshailer/assignment-tracker:latest
docker compose -p 'assignment-tracker' -f ./docker/docker-compose.yml up -d
