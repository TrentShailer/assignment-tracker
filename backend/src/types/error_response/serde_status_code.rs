use axum::http::StatusCode;
use serde::{de::Visitor, Deserializer, Serializer};

/// Visitor to handle Status code deserialization
struct StatusCodeVisitor;
impl<'de> Visitor<'de> for StatusCodeVisitor {
    type Value = StatusCode;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("a u16 http status code")
    }

    fn visit_u16<E>(self, v: u16) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        StatusCode::from_u16(v)
            .map_err(|_| E::custom(format!("{v} is an invalid http status code")))
    }

    fn visit_u64<E>(self, v: u64) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        if v > u16::MAX as u64 {
            return Err(E::custom(format!("{v} is an invalid http status code")));
        }

        self.visit_u16(v as u16)
    }

    fn visit_i64<E>(self, v: i64) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        if v > u16::MAX as i64 || v < 1 {
            return Err(E::custom(format!("{v} is an invalid http status code")));
        };

        self.visit_u16(v as u16)
    }
}

/// Serializses the status as a u16.
pub fn serialize_status_code<S>(status: &StatusCode, se: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    se.serialize_u16(status.as_u16())
}

/// Deserializses the status from a u16.
pub fn deserialize_status_code<'a, D>(de: D) -> Result<StatusCode, D::Error>
where
    D: Deserializer<'a>,
{
    de.deserialize_u16(StatusCodeVisitor)
}
