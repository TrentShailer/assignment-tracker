use axum::{extract::FromRequest, response::IntoResponse};
use serde::Serialize;

use crate::error_response::ErrorResponse;

/// Custom wrapper for axum's Json extractor that returns errors following the API.
#[derive(FromRequest)]
#[from_request(via(axum::Json), rejection(ErrorResponse))]
pub struct Json<T>(pub T);

impl<T: Serialize> IntoResponse for Json<T> {
    fn into_response(self) -> axum::response::Response {
        let Self(value) = self;
        axum::Json(value).into_response()
    }
}
