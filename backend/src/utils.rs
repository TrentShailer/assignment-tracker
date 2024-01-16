use log::error;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error_response::ErrorResponse;

pub async fn user_exists(id: &Uuid, pool: &PgPool) -> Result<bool, ErrorResponse> {
    let maybe_user = sqlx::query!(
        "
        SELECT COUNT(*)
        FROM users
        WHERE id = $1;
        ",
        id
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    match maybe_user {
        Some(_) => Ok(true),
        None => Ok(false),
    }
}
