use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHasher,
};
use axum::{extract::State, http::StatusCode, Json};
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use thiserror::Error;
use tower_sessions::Session;

use crate::{
    error_response::{ErrorResponse, FieldError},
    types::User,
    SESSION_USER_ID_KEY,
};

#[derive(Deserialize, Serialize)]
pub struct CreateUserBody {
    pub username: String,
    pub password: String,
}

pub async fn create_user(
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<CreateUserBody>,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    validate_body(&body.username, &body.password)
        .map_err(|e| ValidationError::into_error_response(StatusCode::BAD_REQUEST, e))?;

    let hash = hash_password(body.password).map_err(|e| {
        error!("{}", e);
        ErrorResponse::HASH_ERROR
    })?;

    let user = sqlx::query_as!(
        User,
        "
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING id, username;
        ",
        &body.username,
        hash
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        if is_unique_violation(&e) {
            ErrorResponse::full(
                StatusCode::BAD_REQUEST,
                "That username is taken.",
                vec![FieldError::new("username", "That username is taken.")],
            )
        } else {
            error!("{}", e);
            ErrorResponse::DATABASE_ERROR
        }
    })?;

    if let Err(e) = session.insert(SESSION_USER_ID_KEY, user.id).await {
        error!("{}", e);
        return Err(ErrorResponse::SESSION_ERROR);
    }

    Ok((StatusCode::CREATED, Json(user)))
}

fn is_unique_violation(error: &sqlx::Error) -> bool {
    if let sqlx::Error::Database(db_error) = error {
        if db_error.is_unique_violation() {
            return true;
        }
    }
    false
}

// Should take ownership so password can't be used after it is hashed
fn hash_password(password: String) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)?
        .to_string();
    Ok(password_hash)
}

fn validate_body(username: &str, password: &str) -> Result<(), Vec<ValidationError>> {
    let mut validation_errors: Vec<ValidationError> = Vec::new();
    if username.len() > 128 {
        validation_errors.push(ValidationError::UsernameTooLong);
    }
    if password.len() > 128 {
        validation_errors.push(ValidationError::PasswordTooLong);
    }

    match validation_errors.is_empty() {
        true => Ok(()),
        false => Err(validation_errors),
    }
}

#[derive(Debug, Error)]
enum ValidationError {
    #[error("Username is too long, maximum 128 characters.")]
    UsernameTooLong,
    #[error("Password is too long, maximum 128 characters.")]
    PasswordTooLong,
}
impl ValidationError {
    fn into_field_error(&self) -> FieldError {
        match self {
            ValidationError::UsernameTooLong => FieldError::new("username", &self.to_string()),
            ValidationError::PasswordTooLong => FieldError::new("password", &self.to_string()),
        }
    }

    pub fn into_error_response(status: StatusCode, errors: Vec<ValidationError>) -> ErrorResponse {
        let fields: Vec<FieldError> = errors.iter().map(Self::into_field_error).collect();
        ErrorResponse::full(status, "Username or password is invalid.", fields)
    }
}
