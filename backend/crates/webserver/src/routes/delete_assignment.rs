use axum::{
    extract::{Path, State},
    http::StatusCode,
};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{CommonError, Course, ErrorResponse, User, SESSION_USER_ID_KEY};

pub async fn delete_assignment(
    Path((course_id, assignment_id)): Path<(Uuid, Uuid)>,
    State(pool): State<PgPool>,
    session: Session,
) -> Result<StatusCode, ErrorResponse> {
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

    if maybe_course.is_none() {
        return Err(CommonError::Course404.into_error_response());
    }

    let rows_affected = sqlx::query(
        "
        DELETE FROM assignments
        WHERE id = $1 AND user_id = $2;
        ",
    )
    .bind(assignment_id)
    .bind(user_id)
    .execute(&pool)
    .await
    .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?
    .rows_affected();

    if rows_affected == 0 {
        return Err(CommonError::Assignment404.into_error_response());
    }

    Ok(StatusCode::OK)
}
