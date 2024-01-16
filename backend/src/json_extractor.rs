/// Modified from https://github.com/tokio-rs/axum/blob/main/axum/src/json.rs
use axum::async_trait;
use axum::extract::{FromRequest, Request};
use axum::http::{
    header::{self, HeaderMap, HeaderValue},
    StatusCode,
};
use axum::response::{IntoResponse, Response};
use bytes::{BufMut, Bytes, BytesMut};
use log::error;
use serde::{de::DeserializeOwned, Serialize};

use crate::error_response::{ErrorResponse, FieldError};

#[derive(Debug, Clone, Copy, Default)]
#[cfg_attr(docsrs, doc(cfg(feature = "json")))]
#[must_use]
pub struct Json<T>(pub T);

#[async_trait]
impl<T, S> FromRequest<S> for Json<T>
where
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = ErrorResponse;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        if json_content_type(req.headers()) {
            let bytes = Bytes::from_request(req, state).await.map_err(|e| {
                error!("{}", e);
                ErrorResponse::basic(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to buffer request body.",
                )
            })?;
            Self::from_bytes(&bytes)
        } else {
            Err(ErrorResponse::basic(
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                "Expected request with `Content-Type: application/json`",
            ))
        }
    }
}

fn json_content_type(headers: &HeaderMap) -> bool {
    let content_type = if let Some(content_type) = headers.get(header::CONTENT_TYPE) {
        content_type
    } else {
        return false;
    };

    let content_type = if let Ok(content_type) = content_type.to_str() {
        content_type
    } else {
        return false;
    };

    let mime = if let Ok(mime) = content_type.parse::<mime::Mime>() {
        mime
    } else {
        return false;
    };

    let is_json_content_type = mime.type_() == "application"
        && (mime.subtype() == "json" || mime.suffix().map_or(false, |name| name == "json"));

    is_json_content_type
}

impl<T> From<T> for Json<T> {
    fn from(inner: T) -> Self {
        Self(inner)
    }
}

impl<T> Json<T>
where
    T: DeserializeOwned,
{
    /// Construct a `Json<T>` from a byte slice. Most users should prefer to use the `FromRequest` impl
    /// but special cases may require first extracting a `Request` into `Bytes` then optionally
    /// constructing a `Json<T>`.
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, ErrorResponse> {
        let deserializer = &mut serde_json::Deserializer::from_slice(bytes);

        let value = match serde_path_to_error::deserialize(deserializer) {
            Ok(value) => value,
            Err(err) => {
                let rejection = match err.inner().classify() {
                    serde_json::error::Category::Data => {
                        // So because api will come from website, handling "." nicely for the user is not neccecary
                        let path = err.path().to_string();
                        if path == "." {
                            ErrorResponse::basic(StatusCode::UNPROCESSABLE_ENTITY, &err.to_string())
                        } else {
                            let full_message = err.inner().to_string();

                            let mut message: Vec<u8> = Vec::with_capacity(full_message.len());
                            for &byte in full_message.as_bytes() {
                                if byte == b':' {
                                    break;
                                }
                                message.push(byte);
                            }
                            let message = String::from_utf8_lossy(&message);

                            let field_error = FieldError::new(&path, &message);

                            ErrorResponse::fields(StatusCode::BAD_REQUEST, vec![field_error])
                        }
                    }
                    serde_json::error::Category::Syntax | serde_json::error::Category::Eof => {
                        ErrorResponse::basic(
                            StatusCode::BAD_REQUEST,
                            "Failed to parse the request body as JSON",
                        )
                    }
                    serde_json::error::Category::Io => {
                        if cfg!(debug_assertions) {
                            // we don't use `serde_json::from_reader` and instead always buffer
                            // bodies first, so we shouldn't encounter any IO errors
                            unreachable!()
                        } else {
                            ErrorResponse::basic(
                                StatusCode::BAD_REQUEST,
                                "Failed to parse the request body as JSON",
                            )
                        }
                    }
                };
                return Err(rejection);
            }
        };

        Ok(Json(value))
    }
}

impl<T> IntoResponse for Json<T>
where
    T: Serialize,
{
    fn into_response(self) -> Response {
        // Use a small initial capacity of 128 bytes like serde_json::to_vec
        // https://docs.rs/serde_json/1.0.82/src/serde_json/ser.rs.html#2189
        let mut buf = BytesMut::with_capacity(128).writer();
        match serde_json::to_writer(&mut buf, &self.0) {
            Ok(()) => (
                [(
                    header::CONTENT_TYPE,
                    HeaderValue::from_static(mime::APPLICATION_JSON.as_ref()),
                )],
                buf.into_inner().freeze(),
            )
                .into_response(),
            Err(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(
                    header::CONTENT_TYPE,
                    HeaderValue::from_static(mime::TEXT_PLAIN_UTF_8.as_ref()),
                )],
                err.to_string(),
            )
                .into_response(),
        }
    }
}
