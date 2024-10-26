pub mod common_errors;
pub mod field_error;
mod serde_status_code;

use crate::json_extractor::Json;
use axum::{http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};

use super::FieldError;

/// An error response from the API.
#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    #[serde(serialize_with = "serde_status_code::serialize_status_code")]
    #[serde(deserialize_with = "serde_status_code::deserialize_status_code")]
    pub status: StatusCode,

    pub message: String,

    pub fields: Option<Vec<FieldError>>,
}

impl ErrorResponse {
    /// Creates an error response with just a status and message.
    pub fn basic<M: Into<String>>(status: StatusCode, message: M) -> Self {
        Self {
            status,
            message: message.into(),
            fields: None,
        }
    }

    /// Constructs a new Error Response with given invalid fields.
    pub fn fields(status: StatusCode, fields: Vec<FieldError>) -> Self {
        let field_names: Vec<String> = fields.iter().map(|f| f.field.to_string()).collect();
        let message = format!("Invalid {}", field_names.join(", "));

        Self {
            status,
            message,
            fields: Some(fields),
        }
    }
}

/// Converts the error response into an axum response
impl IntoResponse for ErrorResponse {
    fn into_response(self) -> axum::response::Response {
        (self.status, Json(self)).into_response()
    }
}
