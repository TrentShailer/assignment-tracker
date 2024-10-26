use sqlx::PgPool;
use webserver::{Config, Webserver};

#[sqlx::test(migrations = "./migrations")]
async fn create_webserver(pool: PgPool) -> sqlx::Result<()> {
    let config = Config {
        origin_url: "http://localhost:8080".to_string(),
        database_url: String::new(),
    };

    Webserver::create_with_pool(&config, pool)
        .await
        .expect("Failed to create webserver");

    // TODO ensure can connect

    Ok(())
}
