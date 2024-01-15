use axum::{extract::State, http::StatusCode};
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    error_response::ErrorResponse,
    json_extractor::Json,
    types::{Assignment, Course},
    utils::user_exists,
    SESSION_USER_ID_KEY,
};

#[derive(Deserialize, Serialize)]
pub struct Body {
    pub course_id: Uuid,
}

#[derive(Serialize)]
pub struct Response {
    pub course: Course,
    pub assignments: Vec<Assignment>,
}

pub async fn import_course(
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<Body>,
) -> Result<(StatusCode, Json<Response>), ErrorResponse> {
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

    let maybe_existing_course = sqlx::query_as!(
        Course,
        "
        SELECT id, name
        FROM courses
        WHERE id = $1;
        ",
        body.course_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    let existing_course = match maybe_existing_course {
        Some(v) => v,
        None => {
            return Err(ErrorResponse::basic(
                StatusCode::NOT_FOUND,
                "No course with that id exists.",
            ))
        }
    };

    let course = sqlx::query_as!(
        Course,
        "
        INSERT INTO courses (name, user_id)
        VALUES ($1, $2)
        RETURNING id, name;
        ",
        existing_course.name,
        user_id
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    let assignments = sqlx::query_as!(
        Assignment,
        "
        INSERT INTO assignments (user_id, course_id, name, out_date, due_date, progress)
        SELECT $1 as user_id, $2 as course_id, name, out_date, due_date, 0 as progress
        FROM assignments
        WHERE course_id = $3
        RETURNING id, course_id, name, out_date, due_date, progress;
        ",
        user_id,
        course.id,
        existing_course.id
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    Ok((
        StatusCode::CREATED,
        Json(Response {
            course,
            assignments,
        }),
    ))
}
