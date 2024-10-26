use axum::{
    extract::{Query, State},
    http::StatusCode,
};
use chrono::NaiveDateTime;
use log::error;
use serde::Deserialize;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    json_extractor::Json, types::Assignment, CommonError, ErrorResponse, User, SESSION_USER_ID_KEY,
};

#[derive(Deserialize)]
pub struct QueryContents {
    now: NaiveDateTime,
}

pub async fn get_all_assignments(
    State(pool): State<PgPool>,
    Query(query): Query<QueryContents>,
    session: Session,
) -> Result<(StatusCode, Json<Vec<Assignment>>), ErrorResponse> {
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

    let mut assignments: Vec<Assignment> = sqlx::query_as(
        "
        SELECT id, course_id, name, out_date, due_date, progress
        FROM assignments
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

    assignments.sort_by(|a, b| a.cmp(&query.now, b));

    Ok((StatusCode::OK, Json(assignments)))
}
