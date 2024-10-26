mod cors;
mod database;
mod router;
mod session;

use std::net::SocketAddr;

use axum::{http::header::InvalidHeaderValue, Router};
use log::info;
use sqlx::PgPool;
use thiserror::Error;
use tokio::{io, net::TcpListener};

use crate::config::Config;

/// Empty type to group Webserver creation relevant functions together.
pub struct Webserver {
    pub router: Router,
}

impl Webserver {
    /// Creates a new instance of the webserver using a config.
    pub async fn create_from_config(config: &Config) -> Result<Self, Error> {
        let cors_layer = Self::configure_cors_layer(config)?;
        let database = Self::connect_database(config).await?;
        let session_layer = Self::configure_session_layer(database.clone()).await?;
        // ^ Clone above is fine, Pool is a wrapper for an arc.

        let router = Self::configure_router(cors_layer, database, session_layer);

        Ok(Self { router })
    }

    /// Creates a new instance of the webserver using a defined pool.
    pub async fn create_with_pool(config: &Config, database: PgPool) -> Result<Self, Error> {
        let cors_layer = Self::configure_cors_layer(config)?;
        let session_layer = Self::configure_session_layer(database.clone()).await?;
        // ^ Clone above is fine, Pool is a wrapper for an arc.

        let router = Self::configure_router(cors_layer, database, session_layer);

        Ok(Self { router })
    }

    pub async fn start(self) -> Result<(), Error> {
        let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
        let listener = TcpListener::bind(addr)
            .await
            .map_err(|error| Error::Unexpected(UnexpectedError::TcpBind(error)))?;

        info!("listening on {}", addr);

        axum::serve(listener, self.router)
            .await
            .map_err(|error| Error::Unexpected(UnexpectedError::AxumServe(error)))?;

        Ok(())
    }
}

/// An error while configuring/starting/serving the webserver.
#[derive(Debug, Error)]
#[non_exhaustive]
pub enum Error {
    #[error("The environment's origin url is invalid:\n{0}")]
    InvalidOriginUrl(#[from] InvalidHeaderValue),

    #[error("The environment's database url is invalid:\n{0}")]
    InvalidDatabaseUrl(#[source] sqlx::Error),

    #[error("Unable to connect to the database:\n{0}")]
    DatabaseConnectionFailure(#[source] sqlx::Error),

    /// An unexpected error where the root cause was not obvious.
    #[error("Encountered an unexpected error:\n{0}")]
    Unexpected(#[from] UnexpectedError),
}

/// Represents an unexpected error where returning a root cause was not obvious.
#[derive(Debug, Error)]
#[non_exhaustive]
pub enum UnexpectedError {
    #[error("Encountered unexpected error while binding TCP listener:\n{0}")]
    TcpBind(#[source] io::Error),

    /// An unexpected sqlx error, message includes the action context for error.
    #[error("Encountered unexpected sqlx error while {1}:\n{0}")]
    Sqlx(#[source] sqlx::Error, &'static str),

    #[error("Encountered unexpected error while serving router:\n{0}")]
    AxumServe(#[source] io::Error),
}
