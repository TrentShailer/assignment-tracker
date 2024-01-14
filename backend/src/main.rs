mod error_response;
mod logger;
mod routes;
mod types;

use std::{net::SocketAddr, time::Duration};

use axum::{
    http::{
        header::{ACCEPT, ACCEPT_LANGUAGE, CONTENT_LANGUAGE, CONTENT_TYPE, RANGE},
        Method,
    },
    routing::{delete, get, post},
    Router,
};

use log::info;
use routes::{
    create_session::create_session, create_user::create_user, delete_session::delete_session,
    delete_user::delete_user, get_user::get_user,
};
use sqlx::{postgres::PgPoolOptions, PgPool};
use tokio::{net::TcpListener, task::JoinHandle};
use tower_http::cors::CorsLayer;
use tower_sessions::{cookie::time, ExpiredDeletion, Expiry, PostgresStore, SessionManagerLayer};

const SESSION_USER_ID_KEY: &str = "user_id";

#[tokio::main]
async fn main() {
    logger::init_fern().expect("Failed to initialise fern");
    match dotenvy::dotenv() {
        Ok(_) => {}
        Err(_) => info!("No .env file"),
    };

    let cors = configure_cors();
    let pool = create_pool().await;
    let (session_layer, deletion_task) = create_session_layer(pool.clone()).await;
    let router = create_router(cors, pool, session_layer);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    let listener = TcpListener::bind(addr).await.unwrap();
    info!("listening on {}", addr);
    axum::serve(listener, router).await.unwrap();
    deletion_task.await.unwrap().unwrap();
}

async fn create_pool() -> PgPool {
    let db_uri = std::env::var("DATABASE_URL").expect("DATABASE_URL not found in env.");

    PgPoolOptions::new()
        .max_connections(20)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&db_uri)
        .await
        .expect("Couldn't connect to database")
}

fn configure_cors() -> CorsLayer {
    let origin_url = std::env::var("ORIGIN_URL").expect(".env must contain ORIGIN_URL");
    let origins = [
        "http://localhost:3000".parse().unwrap(),
        origin_url.parse().unwrap(),
    ];

    CorsLayer::new()
        .allow_origin(origins)
        .allow_headers([
            ACCEPT,
            ACCEPT_LANGUAGE,
            CONTENT_LANGUAGE,
            CONTENT_TYPE,
            RANGE,
        ])
        .allow_methods([
            Method::POST,
            Method::GET,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_credentials(true)
}

async fn create_session_layer(
    pool: PgPool,
) -> (
    SessionManagerLayer<PostgresStore>,
    JoinHandle<Result<(), tower_sessions::session_store::Error>>,
) {
    let session_store = PostgresStore::new(pool);
    session_store
        .migrate()
        .await
        .expect("Couldn't migrate session store");
    let deletion_task = tokio::task::spawn(
        session_store
            .clone()
            .continuously_delete_expired(tokio::time::Duration::from_secs(60)),
    );

    let session_layer = SessionManagerLayer::new(session_store)
        .with_secure(false)
        .with_expiry(Expiry::OnInactivity(time::Duration::days(30)))
        .with_name("session_id");

    (session_layer, deletion_task)
}

fn create_router(
    cors: CorsLayer,
    pool: PgPool,
    session_layer: SessionManagerLayer<PostgresStore>,
) -> Router {
    Router::new()
        .route("/api/v1/session", post(create_session))
        .route("/api/v1/session", delete(delete_session))
        .route("/api/v1/user", get(get_user))
        .route("/api/v1/user", delete(delete_user))
        .route("/api/v1/users", post(create_user))
        // .route("/api/v1/assignments", get())
        // .route("/api/v1/courses", get())
        // .route("/api/v1/courses", post())
        // .route("/api/v1/courses/import", post())
        // .route("/api/v1/courses/:course_id", put())
        // .route("/api/v1/courses/:course_id", delete())
        // .route("/api/v1/courses/:course_id/assignments", post())
        // .route("/api/v1/courses/:course_id/assignments/:assignment_id", put())
        // .route("/api/v1/courses/:course_id/assignments/:assignment_id", delete())
        .layer(cors)
        .layer(session_layer)
        .with_state(pool)
}
