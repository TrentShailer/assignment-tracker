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
    json_extractor::Json, Assignment, CommonError, Course, ErrorResponse, FieldError, User,
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
        CommonError::InternalSessionError.into_error_response()
    })?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(CommonError::NoSession.into_error_response()),
    };

    let user_exists = User::exists(user_id, &pool).await.map_err(|e| {
        error!("{e}");
        CommonError::InternalDatabaseError.into_error_response()
    })?;

    if !user_exists {
        session.delete().await.map_err(|e| {
            error!("{}", e);
            CommonError::InternalSessionError.into_error_response()
        })?;
        return Err(CommonError::UserGone.into_error_response());
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

    let maybe_course: Option<Course> = sqlx::query_as(
        "
        SELECT id, name
        FROM courses
        WHERE id = $1 AND user_id = $2;
        ",
    )
    .bind(course_id)
    .bind(user_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        CommonError::InternalDatabaseError.into_error_response()
    })?;

    if maybe_course.is_none() {
        return Err(CommonError::Course404.into_error_response());
    }

    let maybe_assignment: Option<Assignment> = sqlx::query_as(
        "
        UPDATE assignments
        SET name = $3, due_date = $4, out_date = $5, progress = $6
        WHERE id = $1 AND user_id = $2
        RETURNING id, course_id, name, due_date, out_date, progress;
        ",
    )
    .bind(assignment_id)
    .bind(user_id)
    .bind(body.name)
    .bind(body.due_date)
    .bind(body.out_date)
    .bind(body.progress)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        CommonError::InternalDatabaseError.into_error_response()
    })?;

    let assignment = match maybe_assignment {
        Some(v) => v,
        None => return Err(CommonError::Assignment404.into_error_response()),
    };

    Ok((StatusCode::OK, Json(assignment)))
}
