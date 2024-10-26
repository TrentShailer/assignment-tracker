use axum::http::{
    header::{ACCEPT, ACCEPT_LANGUAGE, CONTENT_LANGUAGE, CONTENT_TYPE, RANGE},
    HeaderValue, Method,
};
use tower_http::cors::CorsLayer;

use crate::config::Config;

use super::Webserver;

impl Webserver {
    /// Configutes a cors layer for the server. Allows access from `env.origin_url` and `localhost:5173`.
    pub(super) fn configure_cors_layer(config: &Config) -> Result<CorsLayer, super::Error> {
        let origins: [HeaderValue; 2] = [
            HeaderValue::from_static("http://localhost:5173"),
            config.origin_url.as_str().parse()?,
        ];

        let cors = CorsLayer::new()
            .allow_origin(origins)
            .allow_headers([
                ACCEPT,
                ACCEPT_LANGUAGE,
                CONTENT_LANGUAGE,
                CONTENT_TYPE,
                RANGE,
            ])
            .allow_methods([
                Method::POST,
                Method::GET,
                Method::PUT,
                Method::DELETE,
                Method::OPTIONS,
                Method::HEAD,
            ])
            .allow_credentials(true);

        Ok(cors)
    }
}
