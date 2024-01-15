use axum::{
    extract::{Path, State},
    http::StatusCode,
};
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

pub async fn update_course(
    Path(course_id): Path<Uuid>,
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

    let maybe_course = sqlx::query_as!(
        Course,
        "
        UPDATE courses
        SET name = $3
        WHERE id = $1 AND user_id = $2
        RETURNING id, name;
        ",
        course_id,
        user_id,
        body.name
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    let course = match maybe_course {
        Some(v) => v,
        None => {
            return Err(ErrorResponse::basic(
                StatusCode::NOT_FOUND,
                "No course with this id exists or you do not own it.",
            ))
        }
    };

    Ok((StatusCode::OK, Json(course)))
}
