pub mod config;
pub mod routes;
pub mod webserver;

mod json_extractor;
mod types;

pub use config::Config;
pub use types::{Assignment, CommonError, Course, ErrorResponse, FieldError, User};
pub use webserver::Webserver;

pub const SESSION_USER_ID_KEY: &str = "user_id";
