use axum::{
    extract::{Path, State},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    json_extractor::Json, CommonError, Course, ErrorResponse, FieldError, User, SESSION_USER_ID_KEY,
};

#[derive(Deserialize, Serialize)]
pub struct Body {
    pub name: String,
}

pub async fn update_course(
    Path(course_id): Path<Uuid>,
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<Body>,
) -> Result<(StatusCode, Json<Course>), ErrorResponse> {
    let maybe_user_id: Option<Uuid> = session
        .get(SESSION_USER_ID_KEY)
        .await
        .map_err(|_| CommonError::InternalSessionError.into_error_response())?;

    let user_id = match maybe_user_id {
        Some(v) => v,
        None => return Err(CommonError::NoSession.into_error_response()),
    };

    let user_exists = User::exists(user_id, &pool)
        .await
        .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    if !user_exists {
        session
            .delete()
            .await
            .map_err(|_| CommonError::InternalSessionError.into_error_response())?;
        return Err(CommonError::UserGone.into_error_response());
    }

    if body.name.is_empty() || body.name.len() > 128 {
        return Err(ErrorResponse::fields(
            StatusCode::BAD_REQUEST,
            vec![FieldError::new(
                "name",
                "Course name must be between 1-128 characters.",
            )],
        ));
    }

    let maybe_course: Option<Course> = sqlx::query_as(
        "
        UPDATE courses
        SET name = $3
        WHERE id = $1 AND user_id = $2
        RETURNING id, name;
        ",
    )
    .bind(course_id)
    .bind(user_id)
    .bind(body.name)
    .fetch_optional(&pool)
    .await
    .map_err(|_| CommonError::InternalDatabaseError.into_error_response())?;

    let course = match maybe_course {
        Some(v) => v,
        None => return Err(CommonError::Course404.into_error_response()),
    };

    Ok((StatusCode::OK, Json(course)))
}
