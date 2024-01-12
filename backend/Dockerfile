FROM rust:1.75 as builder
WORKDIR /usr/src/assignment-tracker-backend
COPY . .
ENV SQLX_OFFLINE true
RUN cargo install --path .
FROM scratch
COPY --from=builder /usr/local/cargo/bin/assignment-tracker-backend /usr/local/bin/assignment-tracker-backend
EXPOSE 8080
CMD ["assignment-tracker-backend"]