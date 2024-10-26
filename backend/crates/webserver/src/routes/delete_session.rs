use axum::http::StatusCode;
use tower_sessions::Session;

use crate::{CommonError, ErrorResponse};

pub async fn delete_session(session: Session) -> Result<StatusCode, ErrorResponse> {
    session
        .delete()
        .await
        .map_err(|_| CommonError::InternalSessionError.into_error_response())?;

    Ok(StatusCode::OK)
}
