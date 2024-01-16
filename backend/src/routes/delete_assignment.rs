use axum::{
    extract::{Path, State},
    http::StatusCode,
};
use log::error;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    error_response::ErrorResponse, types::Course, utils::user_exists, SESSION_USER_ID_KEY,
};

pub async fn delete_assignment(
    Path((course_id, assignment_id)): Path<(Uuid, Uuid)>,
    State(pool): State<PgPool>,
    session: Session,
) -> Result<StatusCode, ErrorResponse> {
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

    let rows_affected = sqlx::query!(
        "
        DELETE FROM assignments
        WHERE id = $1 AND user_id = $2;
        ",
        assignment_id,
        user_id,
    )
    .execute(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?
    .rows_affected();

    if rows_affected == 0 {
        return Err(ErrorResponse::MISSING_OR_UNOWNED_ASSIGNMENT);
    }

    Ok(StatusCode::OK)
}
