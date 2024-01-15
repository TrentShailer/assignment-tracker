use axum::{extract::State, http::StatusCode};
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    error_response::{ErrorResponse, FieldError},
    json_extractor::Json,
    types::Course,
    utils::user_exists,
    SESSION_USER_ID_KEY,
};

#[derive(Deserialize, Serialize)]
pub struct Body {
    pub name: String,
}

pub async fn create_course(
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<Body>,
) -> Result<(StatusCode, Json<Course>), ErrorResponse> {
    let maybe_user_id: Option<Uuid> = session.get(SESSION_USER_ID_KEY).await.map_err(|e| {
        error!("{}", e);
        ErrorResponse::SESSION_ERROR
    })?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(ErrorResponse::NO_SESSION),
    };

    if !user_exists(&user_id, &pool).await? {
        return Err(ErrorResponse::DELETED_USER);
    }

    if body.name.len() == 0 || body.name.len() > 128 {
        return Err(ErrorResponse::fields(
            StatusCode::BAD_REQUEST,
            vec![FieldError::new(
                "name",
                "Course name must be between 1-128 characters.",
            )],
        ));
    }

    let course = sqlx::query_as!(
        Course,
        "
        INSERT INTO courses (name, user_id)
        VALUES ($1, $2)
        RETURNING id, name;
        ",
        body.name,
        user_id
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    Ok((StatusCode::CREATED, Json(course)))
}
