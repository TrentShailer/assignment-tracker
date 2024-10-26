use axum::{extract::State, http::StatusCode};
use log::error;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    json_extractor::Json, types::Course, CommonError, ErrorResponse, User, SESSION_USER_ID_KEY,
};

pub async fn get_all_courses(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<(StatusCode, Json<Vec<Course>>), ErrorResponse> {
    let maybe_user_id: Option<Uuid> = session.get(SESSION_USER_ID_KEY).await.map_err(|e| {
        error!("{}", e);
        CommonError::InternalSessionError.into_error_response()
    })?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(CommonError::NoSession.into_error_response()),
    };

    let user_exists = User::exists(user_id, &pool).await.map_err(|e| {
        error!("{e}");
        CommonError::InternalDatabaseError.into_error_response()
    })?;

    if !user_exists {
        session.delete().await.map_err(|e| {
            error!("{}", e);
            CommonError::InternalSessionError.into_error_response()
        })?;
        return Err(CommonError::UserGone.into_error_response());
    }

    let courses: Vec<Course> = sqlx::query_as(
        "
        SELECT id, name
        FROM courses
        WHERE user_id = $1;
        ",
    )
    .bind(user_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        error!("{}", e);
        CommonError::InternalDatabaseError.into_error_response()
    })?;

    Ok((StatusCode::OK, Json(courses)))
}
