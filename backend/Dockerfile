FROM rust:1.79 as builder
WORKDIR /usr/src/server
COPY . .
RUN rustup target add x86_64-unknown-linux-musl
ENV SQLX_OFFLINE true
RUN cargo install --locked --target=x86_64-unknown-linux-musl --path .
FROM scratch
COPY --from=builder /usr/local/cargo/bin/server /usr/local/bin/server
EXPOSE 8080
CMD ["server"]
