use axum::{extract::State, http::StatusCode, Json};
use log::error;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{error_response::ErrorResponse, types::User, SESSION_USER_ID_KEY};

pub async fn get_user(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    let maybe_user_id: Option<Uuid> = session.get(SESSION_USER_ID_KEY).await.map_err(|e| {
        error!("{}", e);
        ErrorResponse::SESSION_ERROR
    })?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(ErrorResponse::NO_SESSION),
    };

    let maybe_user = sqlx::query_as!(
        User,
        "
        SELECT id, username
        FROM users
        WHERE id = $1;
        ",
        user_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    let user = match maybe_user {
        Some(v) => v,
        None => return Err(ErrorResponse::DELETED_USER),
    };

    Ok((StatusCode::OK, Json(user)))
}
