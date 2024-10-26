use axum::{
    extract::{Path, State},
    http::StatusCode,
};
use chrono::NaiveDateTime;
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

pub async fn create_assignment(
    Path(course_id): Path<Uuid>,
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<Body>,
) -> Result<(StatusCode, Json<Assignment>), ErrorResponse> {
    let maybe_user_id: Option<Uuid> = session
        .get(SESSION_USER_ID_KEY)
        .await
        .map_err(|_| CommonError::NoSession.into_error_response())?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(CommonError::NoSession.into()),
    };

    let user_exists = User::exists(user_id, &pool)
        .await
        .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    if !user_exists {
        session
            .delete()
            .await
            .map_err(|_| CommonError::NoSession.into_error_response())?;
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
    .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    let course = match maybe_course {
        Some(v) => v,
        None => return Err(CommonError::Course404.into()),
    };

    let assignment: Assignment = sqlx::query_as(
        "
        INSERT INTO assignments (user_id, course_id, name, due_date, out_date, progress)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, course_id, name, due_date, out_date, progress;
        ",
    )
    .bind(user_id)
    .bind(course.id)
    .bind(body.name)
    .bind(body.due_date)
    .bind(body.out_date)
    .bind(body.progress)
    .fetch_one(&pool)
    .await
    .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    Ok((StatusCode::CREATED, Json(assignment)))
}
