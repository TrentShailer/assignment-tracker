use std::env::VarError;

use thiserror::Error;

/// Structure representing the servers config variables.
pub struct Config {
    /// The database connection url string.
    ///
    /// Env key: `DATABASE_URL`
    pub database_url: String,

    /// The url for the allowed origin.
    ///
    /// Env key: `ORIGIN_URL`
    pub origin_url: String,
}

impl Config {
    /// Tries to load the config form the environment variables.
    pub fn load_from_env() -> Result<Self, Error> {
        let database_url =
            std::env::var("DATABASE_URL").map_err(|error| Error::from((error, "DATABASE_URL")))?;

        let origin_url =
            std::env::var("ORIGIN_URL").map_err(|error| Error::from((error, "ORIGIN_URL")))?;

        Ok(Self {
            database_url,
            origin_url,
        })
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
#[non_exhaustive]
pub enum Error {
    #[error("Configuration value {0} was missing.")]
    MissingValue(&'static str),

    /// Environment variable error, only returned from `Config::load_from_env`.
    #[error("Configuration value {1} has an invalid environment variable:\n{0}")]
    InvalidEnvVar(#[source] VarError, &'static str),
}

/// Converts a Env VarError and a environment variable key into an Error.
impl From<(VarError, &'static str)> for Error {
    fn from(value: (VarError, &'static str)) -> Self {
        let (error, env_var) = value;

        match error {
            VarError::NotPresent => Error::MissingValue(env_var),
            _ => Error::InvalidEnvVar(error, env_var),
        }
    }
}
