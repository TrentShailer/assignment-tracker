use axum::{
    extract::{Path, State},
    http::StatusCode,
};
use chrono::NaiveDateTime;
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    error_response::{ErrorResponse, FieldError},
    json_extractor::Json,
    types::{Assignment, Course},
    utils::user_exists,
    SESSION_USER_ID_KEY,
};

#[derive(Deserialize, Serialize)]
pub struct Body {
    pub name: String,
    pub due_date: NaiveDateTime,
    pub out_date: NaiveDateTime,
    pub progress: i16,
}

pub async fn create_assignment(
    Path(course_id): Path<Uuid>,
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<Body>,
) -> Result<(StatusCode, Json<Assignment>), ErrorResponse> {
    let maybe_user_id: Option<Uuid> = session.get(SESSION_USER_ID_KEY).await.map_err(|e| {
        error!("{}", e);
        ErrorResponse::SESSION_ERROR
    })?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(ErrorResponse::NO_SESSION),
    };

    if !user_exists(&user_id, &pool).await? {
        session.delete().await.map_err(|e| {
            error!("{}", e);
            ErrorResponse::SESSION_ERROR
        })?;
        return Err(ErrorResponse::DELETED_USER);
    }

    if body.name.is_empty() || body.name.len() > 128 {
        return Err(ErrorResponse::fields(
            StatusCode::BAD_REQUEST,
            vec![FieldError::new(
                "name",
                "Assignment name must be between 1-128 characters.",
            )],
        ));
    }

    let maybe_course = sqlx::query_as!(
        Course,
        "
        SELECT id, name
        FROM courses
        WHERE id = $1 AND user_id = $2;
        ",
        course_id,
        user_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    let course = match maybe_course {
        Some(v) => v,
        None => return Err(ErrorResponse::MISSING_OR_UNOWNED_COURSE),
    };

    let assignment = sqlx::query_as!(
        Assignment,
        "
        INSERT INTO assignments (user_id, course_id, name, due_date, out_date, progress)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, course_id, name, due_date, out_date, progress;
        ",
        user_id,
        course.id,
        body.name,
        body.due_date,
        body.out_date,
        body.progress
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    Ok((StatusCode::CREATED, Json(assignment)))
}
