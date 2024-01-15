use argon2::{password_hash, Argon2, PasswordHash, PasswordVerifier};
use axum::{extract::State, http::StatusCode};
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    error_response::ErrorResponse, json_extractor::Json, types::User, SESSION_USER_ID_KEY,
};

#[derive(Deserialize, Serialize)]
pub struct Body {
    pub username: String,
    pub password: String,
}

struct FullUser {
    pub id: Uuid,
    pub username: String,
    pub password: String,
}

pub async fn create_session(
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<Body>,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    let maybe_user = sqlx::query_as!(
        FullUser,
        "
        SELECT id, username, password
        FROM users
        WHERE username = $1;
        ",
        body.username
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        ErrorResponse::DATABASE_ERROR
    })?;

    let user = match maybe_user {
        Some(v) => v,
        None => {
            return Err(ErrorResponse::basic(
                StatusCode::BAD_REQUEST,
                "Username or password are incorrect.",
            ))
        }
    };

    let parsed_hash = PasswordHash::new(&user.password).map_err(|e| {
        error!("{}", e);
        ErrorResponse::HASH_ERROR
    })?;

    let result = Argon2::default().verify_password(body.password.as_bytes(), &parsed_hash);

    if let Err(e) = result {
        if e == password_hash::Error::Password {
            return Err(ErrorResponse::basic(
                StatusCode::BAD_REQUEST,
                "Username or password are incorrect.",
            ));
        }
        error!("{}", e);
        return Err(ErrorResponse::HASH_ERROR);
    }

    session
        .insert(SESSION_USER_ID_KEY, user.id)
        .await
        .map_err(|e| {
            error!("{}", e);
            ErrorResponse::SESSION_ERROR
        })?;

    Ok((
        StatusCode::CREATED,
        Json(User {
            id: user.id,
            username: user.username,
        }),
    ))
}
