FROM rust:1.79 as builder
WORKDIR /usr/src/assignment-tracker-backend
COPY . .
RUN rustup target add x86_64-unknown-linux-musl
ENV SQLX_OFFLINE true
RUN cargo install --locked --target=x86_64-unknown-linux-musl --path .
FROM scratch
COPY --from=builder /usr/local/cargo/bin/assignment-tracker-backend /usr/local/bin/assignment-tracker-backend
EXPOSE 8080
CMD ["assignment-tracker-backend"]
