use axum::{extract::State, http::StatusCode};
use log::error;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{json_extractor::Json, CommonError, ErrorResponse, User, SESSION_USER_ID_KEY};

pub async fn get_user(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    let maybe_user_id: Option<Uuid> = session.get(SESSION_USER_ID_KEY).await.map_err(|e| {
        error!("{}", e);
        CommonError::InternalSessionError.into_error_response()
    })?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(CommonError::NoSession.into_error_response()),
    };

    let maybe_user: Option<User> = sqlx::query_as(
        "
        SELECT id, username
        FROM users
        WHERE id = $1;
        ",
    )
    .bind(user_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        CommonError::InternalDatabaseError.into_error_response()
    })?;

    let user = match maybe_user {
        Some(v) => v,
        None => {
            session.delete().await.map_err(|e| {
                error!("{}", e);
                CommonError::InternalSessionError.into_error_response()
            })?;
            return Err(CommonError::UserGone.into_error_response());
        }
    };

    Ok((StatusCode::OK, Json(user)))
}
