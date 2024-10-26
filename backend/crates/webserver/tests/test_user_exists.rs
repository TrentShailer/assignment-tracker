use sqlx::PgPool;
use uuid::Uuid;
use webserver::User;

#[sqlx::test(migrations = "./migrations")]
async fn user_doesnt_exist(pool: PgPool) -> sqlx::Result<()> {
    let id =
        Uuid::parse_str("4e6e6c40-6097-40d1-b555-34022ad2f25f").expect("Failed to parse uuid str");

    let exists = User::exists(id, &pool)
        .await
        .expect("Failed to check if user exists");

    assert!(!exists);

    Ok(())
}

/// Tests for User::exists where the user exists
#[sqlx::test(migrations = "./migrations")]
async fn user_exists(pool: PgPool) -> sqlx::Result<()> {
    let id = Uuid::new_v4();

    let _result = sqlx::query("
			insert into users(id, username, password)
			values($1, $2, $3)
			")
			.bind(id)
			.bind("test_user")
			.bind("$argon2id$v=19$m=19456,t=2,p=1$mc1WCIvgYv/21OPbsXkF8A$ALm+ZdTLfHa7cZjRnNx2QZJxARYWlxVxgeI7aDcdXdw")
			.execute(&pool)
			.await
			.expect("Failed to create user");

    let exists = User::exists(id, &pool)
        .await
        .expect("Failed to check if user exists");

    assert!(exists);

    Ok(())
}
