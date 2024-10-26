use argon2::{password_hash, Argon2, PasswordHash, PasswordVerifier};
use axum::{extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, PgPool};
use tower_sessions::Session;
use tracing::error;
use uuid::Uuid;

use crate::{json_extractor::Json, CommonError, ErrorResponse, User, SESSION_USER_ID_KEY};

#[derive(Deserialize, Serialize)]
pub struct Body {
    pub username: String,
    pub password: String,
}

#[derive(Deserialize, FromRow)]
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
    let maybe_user: Option<FullUser> = sqlx::query_as(
        "
        SELECT id, username, password
        FROM users
        WHERE username = $1;
        ",
    )
    .bind(body.username)
    .fetch_optional(&pool)
    .await
    .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    let user = match maybe_user {
        Some(v) => v,
        None => {
            return Err(ErrorResponse::basic(
                StatusCode::BAD_REQUEST,
                "Username or password are incorrect.",
            ))
        }
    };

    let parsed_hash = PasswordHash::new(&user.password)
        .map_err(|_| CommonError::InternalHashError.into_error_response())?;

    let result = Argon2::default().verify_password(body.password.as_bytes(), &parsed_hash);

    if let Err(e) = result {
        if e == password_hash::Error::Password {
            return Err(ErrorResponse::basic(
                StatusCode::BAD_REQUEST,
                "Username or password are incorrect.",
            ));
        }
        error!("Failed to check hash:\n{e}");
        return Err(CommonError::InternalHashError.into_error_response());
    }

    session
        .insert(SESSION_USER_ID_KEY, user.id)
        .await
        .map_err(|_| CommonError::InternalSessionError.into_error_response())?;

    Ok((
        StatusCode::CREATED,
        Json(User {
            id: user.id,
            username: user.username,
        }),
    ))
}
