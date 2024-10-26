use webserver::{config::Error, Config};

const DATABASE_URL: &str = "DATABASE_URL";
const DATABASE_URL_VALUE: &str = "postgres://postgres:postgres@localhost:5432/postgres";

const ORIGIN_URL: &str = "ORIGIN_URL";
const ORIGIN_URL_VALUE: &str = "http://localhost:8080";

#[test]
fn load_from_env_valid() {
    let config = temp_env::with_vars(
        [
            (DATABASE_URL, Some(DATABASE_URL_VALUE)),
            (ORIGIN_URL, Some(ORIGIN_URL_VALUE)),
        ],
        Config::load_from_env,
    );

    let config = config.expect("Failed to laod config from env");

    assert_eq!(DATABASE_URL_VALUE.to_string(), config.database_url);
    assert_eq!(ORIGIN_URL_VALUE.to_string(), config.origin_url);
}

#[test]
fn load_from_env_missing_db_url() {
    let config = temp_env::with_vars(
        [(DATABASE_URL, None), (ORIGIN_URL, Some(ORIGIN_URL_VALUE))],
        Config::load_from_env,
    );

    match config {
        Ok(_) => panic!("Config load did not return Err"),
        Err(e) => assert_eq!(Error::MissingValue(DATABASE_URL), e),
    };
}

#[test]
fn load_from_env_missing_origin_url() {
    let config = temp_env::with_vars(
        [(DATABASE_URL, Some(DATABASE_URL_VALUE)), (ORIGIN_URL, None)],
        Config::load_from_env,
    );

    match config {
        Ok(_) => panic!("Config load did not return Err"),
        Err(e) => assert_eq!(Error::MissingValue(ORIGIN_URL), e),
    };
}
