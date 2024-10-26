use std::time::Duration;

use sqlx::{postgres::PgPoolOptions, PgPool};

use crate::config::Config;

use super::{UnexpectedError, Webserver};

impl Webserver {
    /// Creates a connection to the database to be used by the webserver.
    pub(super) async fn connect_database(config: &Config) -> Result<PgPool, super::Error> {
        // TODO
        let pool_connection_result = PgPoolOptions::new()
            .max_connections(5)
            .acquire_timeout(Duration::from_secs(3))
            .connect(&config.database_url)
            .await;

        pool_connection_result.map_err(|connection_error| match connection_error {
            // Configuration errors indicate invalid database url.
            sqlx::Error::Configuration(_) => super::Error::InvalidDatabaseUrl(connection_error),

            // Io errors indicate that there was a connection failure.
            sqlx::Error::Io(_) => super::Error::DatabaseConnectionFailure(connection_error),

            // Any other error types are unexpected.
            unexpected_error => super::Error::Unexpected(UnexpectedError::Sqlx(
                unexpected_error,
                "creating postgres pool",
            )),
        })
    }
}
