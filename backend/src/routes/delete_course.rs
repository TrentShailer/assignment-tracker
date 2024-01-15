use axum::{
    extract::{Path, State},
    http::StatusCode,
};
use log::error;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{error_response::ErrorResponse, utils::user_exists, SESSION_USER_ID_KEY};

pub async fn delete_course(
    Path(course_id): Path<Uuid>,
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
        return Err(ErrorResponse::DELETED_USER);
    }

    let rows_affected = sqlx::query!(
        "
        DELETE FROM courses
        WHERE id = $1 AND user_id = $2;
        ",
        course_id,
        user_id
    )
    .execute(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?
    .rows_affected();

    if rows_affected == 0 {
        return Err(ErrorResponse::basic(
            StatusCode::NOT_FOUND,
            "No course with this id exists or you do not own it.",
        ));
    }

    Ok(StatusCode::OK)
}
