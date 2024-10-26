pub mod config;
pub mod error_response;
pub mod routes;
pub mod webserver;

pub(crate) mod json_extractor;

mod data_models;

pub use config::Config;
pub use data_models::{assignment::Assignment, course::Course, user::User};
pub use error_response::{common_errors::CommonError, field_error::FieldError, ErrorResponse};
pub use webserver::Webserver;

pub const SESSION_USER_ID_KEY: &str = "user_id";
