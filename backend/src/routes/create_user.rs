use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHasher,
};
use axum::{extract::State, http::StatusCode};
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use thiserror::Error;
use tower_sessions::Session;

use crate::{
    error_response::{ErrorResponse, FieldError},
    json_extractor::Json,
    types::User,
    SESSION_USER_ID_KEY,
};

#[derive(Deserialize, Serialize)]
pub struct Body {
    pub username: String,
    pub password: String,
}

pub async fn create_user(
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<Body>,
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
            ErrorResponse::fields(
                StatusCode::BAD_REQUEST,
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
    if username.is_empty() || username.len() > 128 {
        validation_errors.push(ValidationError::UsernameLength);
    }
    if password.is_empty() || password.len() > 128 {
        validation_errors.push(ValidationError::PasswordLength);
    }

    match validation_errors.is_empty() {
        true => Ok(()),
        false => Err(validation_errors),
    }
}

#[derive(Debug, Error)]
enum ValidationError {
    #[error("Username must be between 1-128 characters.")]
    UsernameLength,
    #[error("Password must be between 1-128 characters.")]
    PasswordLength,
}
impl ValidationError {
    fn as_field_error(&self) -> FieldError {
        match self {
            ValidationError::UsernameLength => FieldError::new("username", &self.to_string()),
            ValidationError::PasswordLength => FieldError::new("password", &self.to_string()),
        }
    }

    pub fn into_error_response(status: StatusCode, errors: Vec<ValidationError>) -> ErrorResponse {
        let fields: Vec<FieldError> = errors.iter().map(Self::as_field_error).collect();
        ErrorResponse::fields(status, fields)
    }
}
