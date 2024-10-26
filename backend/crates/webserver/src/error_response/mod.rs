pub mod common_errors;
pub mod field_error;
mod serde_status_code;

use axum::{extract::rejection::JsonRejection, http::StatusCode, response::IntoResponse, Json};
use field_error::FieldError;
use serde::{Deserialize, Serialize};

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

/// Converts Json Extractor error into an error response.
impl From<JsonRejection> for ErrorResponse {
    fn from(value: JsonRejection) -> Self {
        match value {
            JsonRejection::JsonDataError(_json_data_error) => Self::basic(
                StatusCode::BAD_REQUEST,
                "Failed to parse the request body as JSON",
            ),

            JsonRejection::JsonSyntaxError(_json_syntax_error) => Self::basic(
                StatusCode::BAD_REQUEST,
                "Failed to parse the request body as JSON",
            ),

            JsonRejection::MissingJsonContentType(_missing_json_content_type) => Self::basic(
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                "Expected request with `Content-Type: application/json`",
            ),

            JsonRejection::BytesRejection(_bytes_rejection) => Self::basic(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to process request JSON.",
            ),

            _ => Self::basic(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to process request JSON.",
            ),
        }
    }
}

/// Converts the error response into an axum response
impl IntoResponse for ErrorResponse {
    fn into_response(self) -> axum::response::Response {
        (self.status, Json(self)).into_response()
    }
}
