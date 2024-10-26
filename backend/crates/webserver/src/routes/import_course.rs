use axum::{extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    json_extractor::Json, Assignment, CommonError, Course, ErrorResponse, User, SESSION_USER_ID_KEY,
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
    let maybe_user_id: Option<Uuid> = session
        .get(SESSION_USER_ID_KEY)
        .await
        .map_err(|_| CommonError::InternalSessionError.into_error_response())?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(CommonError::NoSession.into_error_response()),
    };

    let user_exists = User::exists(user_id, &pool)
        .await
        .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    if !user_exists {
        session
            .delete()
            .await
            .map_err(|_| CommonError::InternalSessionError.into_error_response())?;
        return Err(CommonError::UserGone.into_error_response());
    }

    let maybe_existing_course: Option<Course> = sqlx::query_as(
        "
        SELECT id, name
        FROM courses
        WHERE id = $1;
        ",
    )
    .bind(body.course_id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    let existing_course = match maybe_existing_course {
        Some(v) => v,
        None => {
            return Err(ErrorResponse::basic(
                StatusCode::NOT_FOUND,
                "No course with that id exists.",
            ))
        }
    };

    let course: Course = sqlx::query_as(
        "
        INSERT INTO courses (name, user_id)
        VALUES ($1, $2)
        RETURNING id, name;
        ",
    )
    .bind(existing_course.name)
    .bind(user_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    let assignments: Vec<Assignment> = sqlx::query_as(
        "
        INSERT INTO assignments (user_id, course_id, name, out_date, due_date, progress)
        SELECT $1 as user_id, $2 as course_id, name, out_date, due_date, 0 as progress
        FROM assignments
        WHERE course_id = $3
        RETURNING id, course_id, name, out_date, due_date, progress;
        ",
    )
    .bind(user_id)
    .bind(course.id)
    .bind(existing_course.id)
    .fetch_all(&pool)
    .await
    .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    Ok((
        StatusCode::CREATED,
        Json(Response {
            course,
            assignments,
        }),
    ))
}
