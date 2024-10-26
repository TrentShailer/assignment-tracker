use sqlx::PgPool;
use tower_sessions::{cookie::time::Duration, Expiry, SessionManagerLayer};
use tower_sessions_sqlx_store::PostgresStore;

use super::{UnexpectedError, Webserver};

impl Webserver {
    /// Creates the middleware to handle sessions.
    pub(super) async fn configure_session_layer(
        database: PgPool,
    ) -> Result<SessionManagerLayer<PostgresStore>, super::Error> {
        let session_store = PostgresStore::new(database);
        session_store.migrate().await.map_err(|error| {
            super::Error::Unexpected(UnexpectedError::Sqlx(
                error,
                "migrating database for session storage",
            ))
        })?;

        let session_layer = SessionManagerLayer::new(session_store)
            .with_secure(false)
            .with_expiry(Expiry::OnInactivity(Duration::days(30)))
            .with_name("session_id");

        Ok(session_layer)
    }
}
