use axum::http::StatusCode;

use super::ErrorResponse;

/// Enumeration of common error responses.
#[non_exhaustive]
pub enum CommonError {
    // Internal errors
    InternalDatabaseError,
    InternalSessionError,
    InternalHashError,

    /// User's account no longer exists.
    UserGone,

    /// The user's session has expired or they are not logged in.
    NoSession,

    /// A requested course does not exist or the user does not own it.
    Course404,

    /// A requested assignment does not exist or the user does not own it.
    Assignment404,
}

impl CommonError {
    pub fn into_error_response(self) -> ErrorResponse {
        self.into()
    }
}

impl From<CommonError> for ErrorResponse {
    fn from(value: CommonError) -> ErrorResponse {
        match value {
            CommonError::InternalDatabaseError => ErrorResponse::basic(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error ocurred when accessing the database.",
            ),

            CommonError::InternalSessionError => ErrorResponse::basic(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error ocurred when accessing the session store.",
            ),

            CommonError::InternalHashError => ErrorResponse::basic(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error ocurred during hashing.",
            ),

            CommonError::UserGone => {
                ErrorResponse::basic(StatusCode::GONE, "Your account no longer exists.")
            }

            CommonError::NoSession => ErrorResponse::basic(
                StatusCode::UNAUTHORIZED,
                "Your session has expired or you are not logged in.",
            ),

            CommonError::Course404 => ErrorResponse::basic(
                StatusCode::NOT_FOUND,
                "No course with that id exists or you do not own it.",
            ),

            CommonError::Assignment404 => ErrorResponse::basic(
                StatusCode::NOT_FOUND,
                "No assignment with that id exists or you do not own it.",
            ),
        }
    }
}
