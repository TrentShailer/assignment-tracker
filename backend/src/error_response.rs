use std::borrow::Cow;

use axum::{http::StatusCode, response::IntoResponse};
use serde::{Serialize, Serializer};

use crate::json_extractor::Json;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    #[serde(serialize_with = "serialize_status_code")]
    status: StatusCode,
    message: Cow<'static, str>,
    fields: Option<Vec<FieldError>>,
}

fn serialize_status_code<S>(status: &StatusCode, se: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    se.serialize_u16(status.as_u16())
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
    pub const MISSING_OR_UNOWNED_COURSE: Self = Self::new_const(
        StatusCode::NOT_FOUND,
        "No course with that id exists or you do not own it.",
    );
    pub const MISSING_OR_UNOWNED_ASSIGNMENT: Self = Self::new_const(
        StatusCode::NOT_FOUND,
        "No assignment with that id exists or you do not own it.",
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
            status,
            message: Cow::Owned(message.to_string()),
            fields: None,
        }
    }

    pub fn fields(status: StatusCode, fields: Vec<FieldError>) -> Self {
        let field_names: Vec<String> = fields.iter().map(|f| f.field.to_string()).collect();
        let message = "Invalid fields: ".to_string() + &field_names.join(", ");

        Self {
            status,
            message: Cow::Owned(message),
            fields: Some(fields),
        }
    }
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> axum::response::Response {
        (self.status, Json(self)).into_response()
    }
}
