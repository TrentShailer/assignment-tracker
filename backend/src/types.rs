use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct Assignment {
    pub id: Uuid,
    pub course_id: Uuid,
    pub name: String,
    pub out_date: NaiveDateTime,
    pub due_date: NaiveDateTime,
    pub progress: i16,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct Course {
    pub id: Uuid,
    pub name: String,
}
