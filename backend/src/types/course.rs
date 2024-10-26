use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

/// Data representation of a course, matching the database's model.
#[derive(Serialize, Deserialize, FromRow)]
pub struct Course {
    pub id: Uuid,
    pub name: String,
}
