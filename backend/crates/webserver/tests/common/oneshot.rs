use axum::{
    body::Body,
    http::{header, Method, Request},
    response::Response,
};
use serde::Serialize;
use serde_json::json;
use sqlx::PgPool;
use tower::ServiceExt;
use webserver::{Config, Webserver};

/// Make a oneshot POST request to a fresh webserver.
pub async fn oneshot_post<S: Serialize>(pool: PgPool, uri: &str, body: S) -> Response {
    let config = Config {
        origin_url: "http://localhost:8080".to_string(),
        database_url: String::new(),
    };

    let webserver = Webserver::create_with_pool(&config, pool)
        .await
        .expect("Failed to create webserver");

    let body = serde_json::to_vec(&json!(body)).expect("Failed to serialize body");

    let request = Request::builder()
        .method(Method::POST)
        .uri(uri)
        .header(header::CONTENT_TYPE, mime::APPLICATION_JSON.as_ref())
        .body(Body::from(body))
        .expect("Faield to build request");

    webserver
        .router
        .oneshot(request)
        .await
        .expect("Failed to make request")
}

/// Make a oneshot POST request to a fresh webserver with an empty body.
pub async fn oneshot_post_empty_body(pool: PgPool, uri: &str) -> Response {
    let config = Config {
        origin_url: "http://localhost:8080".to_string(),
        database_url: String::new(),
    };

    let webserver = Webserver::create_with_pool(&config, pool)
        .await
        .expect("Failed to create webserver");

    let request = Request::builder()
        .method(Method::POST)
        .uri(uri)
        .header(header::CONTENT_TYPE, mime::APPLICATION_JSON.as_ref())
        .body(Body::empty())
        .expect("Faield to build request");

    webserver
        .router
        .oneshot(request)
        .await
        .expect("Failed to make request")
}
