use assignment_tracker_backend::{Config, Webserver};
use sqlx::PgPool;

#[sqlx::test(migrations = "./migrations")]
async fn create_webserver(pool: PgPool) -> sqlx::Result<()> {
    let config = Config {
        origin_url: "http://localhost:8080".to_string(),
        database_url: String::new(),
    };

    Webserver::create_with_pool(&config, pool)
        .await
        .expect("Failed to create webserver");

    Ok(())
}
