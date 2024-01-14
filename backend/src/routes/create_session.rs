use argon2::{Argon2, PasswordHash, PasswordVerifier};
use axum::{extract::State, http::StatusCode, Json};
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{error_response::ErrorResponse, types::User, SESSION_USER_ID_KEY};

#[derive(Deserialize, Serialize)]
pub struct CreateSessionBody {
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
    Json(body): Json<CreateSessionBody>,
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

    match result {
        Ok(_) => {
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
        Err(e) => match e {
            argon2::password_hash::Error::Password => Err(ErrorResponse::basic(
                StatusCode::BAD_REQUEST,
                "Username or password are incorrect.",
            )),
            _ => {
                error!("{}", e);
                Err(ErrorResponse::HASH_ERROR)
            }
        },
    }
}
