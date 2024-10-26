use axum::http::StatusCode;
use log::error;
use tower_sessions::Session;

use crate::{CommonError, ErrorResponse};

pub async fn delete_session(session: Session) -> Result<StatusCode, ErrorResponse> {
    session.delete().await.map_err(|e| {
        error!("{}", e);
        CommonError::InternalSessionError.into_error_response()
    })?;

    Ok(StatusCode::OK)
}
