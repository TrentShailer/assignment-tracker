use axum::response::Response;
use http_body_util::BodyExt;
use serde::de::DeserializeOwned;

pub async fn get_response_body<T: DeserializeOwned>(response: Response) -> T {
    let body = response
        .into_body()
        .collect()
        .await
        .expect("Failed to collect body")
        .to_bytes();

    serde_json::from_slice(&body).expect("Failed to deserialize body")
}
