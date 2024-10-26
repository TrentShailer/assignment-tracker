use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;
use tower_http::cors::CorsLayer;
use tower_sessions::SessionManagerLayer;
use tower_sessions_sqlx_store::PostgresStore;

use crate::routes::{
    create_assignment, create_course, create_session, create_user, delete_assignment,
    delete_course, delete_session, delete_user, get_all_assignments, get_all_courses, get_user,
    import_course, update_assignment, update_course,
};

use super::Webserver;

impl Webserver {
    /// Configures the router, registers all routes and middleware.
    pub(super) fn configure_router(
        cors: CorsLayer,
        database: PgPool,
        session_layer: SessionManagerLayer<PostgresStore>,
    ) -> Router {
        Router::new()
            // Session routes
            .route("/api/session", post(create_session))
            .route("/api/session", delete(delete_session))
            // user routes
            .route("/api/user", get(get_user))
            .route("/api/user", delete(delete_user))
            .route("/api/users", post(create_user))
            // assignment route
            .route("/api/assignments", get(get_all_assignments))
            // courses
            .route("/api/courses", get(get_all_courses))
            .route("/api/courses", post(create_course))
            .route("/api/courses/import", post(import_course))
            // specific course routes
            .route("/api/courses/:course_id", put(update_course))
            .route("/api/courses/:course_id", delete(delete_course))
            .route(
                "/api/courses/:course_id/assignments",
                post(create_assignment),
            )
            // specific course, specific assignment routes
            .route(
                "/api/courses/:course_id/assignments/:assignment_id",
                put(update_assignment),
            )
            .route(
                "/api/courses/:course_id/assignments/:assignment_id",
                delete(delete_assignment),
            )
            // middleware
            .layer(cors)
            .layer(session_layer)
            .with_state(database)
    }
}
