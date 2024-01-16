use axum::http::StatusCode;
use log::error;
use tower_sessions::Session;

use crate::error_response::ErrorResponse;

pub async fn delete_session(session: Session) -> Result<StatusCode, ErrorResponse> {
    session.delete().await.map_err(|e| {
        error!("{}", e);
        ErrorResponse::SESSION_ERROR
    })?;

    Ok(StatusCode::OK)
}
