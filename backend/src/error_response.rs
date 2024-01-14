use std::borrow::Cow;

use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;

#[derive(Serialize)]
#[serde(remote = "StatusCode")]
struct StatusCodeDef {
    #[serde(getter = "StatusCode::as_u16")]
    code: u16,
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    #[serde(with = "StatusCodeDef")]
    status: StatusCode,
    message: Cow<'static, str>,
    fields: Option<Vec<FieldError>>,
}

#[derive(Debug, Serialize)]
pub struct FieldError {
    field: String,
    message: String,
}

impl FieldError {
    pub fn new(field: &str, message: &str) -> Self {
        Self {
            field: field.to_string(),
            message: message.to_string(),
        }
    }
}

impl ErrorResponse {
    pub const DATABASE_ERROR: Self = Self::new_const(
        StatusCode::INTERNAL_SERVER_ERROR,
        "Error ocurred when talking to database.",
    );
    pub const SESSION_ERROR: Self = Self::new_const(
        StatusCode::INTERNAL_SERVER_ERROR,
        "Error ocurred when accessing the session store.",
    );
    pub const HASH_ERROR: Self = Self::new_const(
        StatusCode::INTERNAL_SERVER_ERROR,
        "Error ocurred during hashing.",
    );
    pub const DELETED_USER: Self =
        Self::new_const(StatusCode::GONE, "Your account no longer exists.");
    pub const NO_SESSION: Self = Self::new_const(
        StatusCode::UNAUTHORIZED,
        "Your session has expired or you are not logged in.",
    );

    pub const fn new_const(status: StatusCode, message: &'static str) -> Self {
        Self {
            status,
            message: Cow::Borrowed(message),
            fields: None,
        }
    }

    pub fn basic(status: StatusCode, message: &str) -> Self {
        Self {
            status: status,
            message: Cow::Owned(message.to_string()),
            fields: None,
        }
    }

    pub fn full(status: StatusCode, message: &str, fields: Vec<FieldError>) -> Self {
        Self {
            status: status,
            message: Cow::Owned(message.to_string()),
            fields: Some(fields),
        }
    }
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> axum::response::Response {
        (self.status, Json(self)).into_response()
    }
}
