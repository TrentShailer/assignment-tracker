use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgExecutor};
use uuid::Uuid;

/// Data representation of a user, does not match the database's model.
#[derive(Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
}

impl User {
    /// Queries the database to check if a user with a given ID exists.
    pub async fn exists<'e>(id: Uuid, database: impl PgExecutor<'e>) -> Result<bool, sqlx::Error> {
        let user_exists = sqlx::query(
            "
    	select 1
    	from users
    	where id = $1
    	",
        )
        .bind(id)
        .fetch_optional(database)
        .await?;

        Ok(user_exists.is_some())
    }
}
