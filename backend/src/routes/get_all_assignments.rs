use axum::{extract::State, http::StatusCode};
use log::error;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    error_response::ErrorResponse, json_extractor::Json, types::Assignment, utils::user_exists,
    SESSION_USER_ID_KEY,
};

pub async fn get_all_assignments(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<(StatusCode, Json<Vec<Assignment>>), ErrorResponse> {
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

    let assignments = sqlx::query_as!(
        Assignment,
        "
        SELECT id, course_id, name, out_date, due_date, progress
        FROM assignments
        WHERE user_id = $1;
        ",
        user_id
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    Ok((StatusCode::OK, Json(assignments)))
}
