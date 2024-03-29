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

pub async fn update_assignment(
    Path((course_id, assignment_id)): Path<(Uuid, Uuid)>,
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

    if maybe_course.is_none() {
        return Err(ErrorResponse::MISSING_OR_UNOWNED_COURSE);
    }

    let maybe_assignment = sqlx::query_as!(
        Assignment,
        "
        UPDATE assignments
        SET name = $3, due_date = $4, out_date = $5, progress = $6
        WHERE id = $1 AND user_id = $2
        RETURNING id, course_id, name, due_date, out_date, progress;
        ",
        assignment_id,
        user_id,
        body.name,
        body.due_date,
        body.out_date,
        body.progress
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    let assignment = match maybe_assignment {
        Some(v) => v,
        None => return Err(ErrorResponse::MISSING_OR_UNOWNED_ASSIGNMENT),
    };

    Ok((StatusCode::OK, Json(assignment)))
}
