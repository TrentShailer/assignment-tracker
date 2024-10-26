use assignment_tracker_backend::{routes::create_user, ErrorResponse, User};
use axum::http::StatusCode;
use sqlx::PgPool;

use crate::common::{get_response_body, oneshot_post, oneshot_post_empty_body};

#[sqlx::test(migrations = "./migrations")]
async fn valid_body(pool: PgPool) -> sqlx::Result<()> {
    let body = create_user::Body {
        username: "User1".to_string(),
        password: "User1".to_string(),
    };

    let response = oneshot_post(pool.clone(), "/api/users", body).await;
    assert_eq!(StatusCode::CREATED, response.status());

    let user: User = get_response_body(response).await;
    assert_eq!("User1".to_string(), user.username);

    let user_exists = User::exists(user.id, &pool)
        .await
        .expect("Failed to check if user exists");
    assert!(user_exists);

    Ok(())
}

#[sqlx::test(migrations = "./migrations")]
async fn empty_body_fields(pool: PgPool) -> sqlx::Result<()> {
    let body = create_user::Body {
        username: String::new(),
        password: String::new(),
    };

    let response = oneshot_post(pool.clone(), "/api/users", body).await;
    assert_eq!(StatusCode::BAD_REQUEST, response.status());

    let error_response: ErrorResponse = get_response_body(response).await;
    assert_eq!(StatusCode::BAD_REQUEST, error_response.status);

    let fields = error_response.fields.expect("response contained no fields");
    assert_eq!(2, fields.len());
    assert!(fields.iter().any(|field| field.field == "username"));
    assert!(fields.iter().any(|field| field.field == "password"));

    Ok(())
}

#[sqlx::test(migrations = "./migrations")]
async fn empty_body(pool: PgPool) -> sqlx::Result<()> {
    let response = oneshot_post_empty_body(pool.clone(), "/api/users").await;
    assert_eq!(StatusCode::BAD_REQUEST, response.status());

    Ok(())
}

#[sqlx::test(migrations = "./migrations")]
async fn long_username(pool: PgPool) -> sqlx::Result<()> {
    let body = create_user::Body {
        username: "a".repeat(129),
        password: "password".to_string(),
    };

    let response = oneshot_post(pool.clone(), "/api/users", body).await;
    assert_eq!(StatusCode::BAD_REQUEST, response.status());

    let error_response: ErrorResponse = get_response_body(response).await;
    assert_eq!(StatusCode::BAD_REQUEST, error_response.status);

    let fields = error_response.fields.expect("response contained no fields");
    assert_eq!(1, fields.len());
    assert_eq!("username".to_string(), fields.first().unwrap().field);

    Ok(())
}

#[sqlx::test(migrations = "./migrations")]
async fn long_password(pool: PgPool) -> sqlx::Result<()> {
    let body = create_user::Body {
        username: "username".to_string(),
        password: "a".repeat(129),
    };

    let response = oneshot_post(pool.clone(), "/api/users", body).await;
    assert_eq!(StatusCode::BAD_REQUEST, response.status());

    let error_response: ErrorResponse = get_response_body(response).await;
    assert_eq!(StatusCode::BAD_REQUEST, error_response.status);

    let fields = error_response.fields.expect("response contained no fields");
    assert_eq!(1, fields.len());
    assert_eq!("password".to_string(), fields.first().unwrap().field);

    Ok(())
}

#[sqlx::test(migrations = "./migrations")]
async fn username_collision(pool: PgPool) -> sqlx::Result<()> {
    sqlx::query(
        "
	insert into users(username, password)
	values($1, $2)
	",
    )
    .bind("username")
    .bind("password")
    .execute(&pool)
    .await
    .expect("Failed to create user");

    let body = create_user::Body {
        username: "username".to_string(),
        password: "password".to_string(),
    };

    let response = oneshot_post(pool.clone(), "/api/users", body).await;
    assert_eq!(StatusCode::BAD_REQUEST, response.status());

    let error_response: ErrorResponse = get_response_body(response).await;
    assert_eq!(StatusCode::BAD_REQUEST, error_response.status);

    let fields = error_response.fields.expect("response contained no fields");
    assert_eq!(1, fields.len());
    assert_eq!("username".to_string(), fields.first().unwrap().field);

    Ok(())
}
