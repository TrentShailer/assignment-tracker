use axum::{extract::State, http::StatusCode};
use log::error;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{error_response::ErrorResponse, SESSION_USER_ID_KEY};

pub async fn delete_user(
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

    let rows_affected = sqlx::query!(
        "
        DELETE FROM users
        WHERE id = $1;
        ",
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
        return Err(ErrorResponse::DELETED_USER);
    }

    if let Err(e) = session.delete().await {
        error!("{}", e);
        return Err(ErrorResponse::SESSION_ERROR);
    }

    Ok(StatusCode::OK)
}
