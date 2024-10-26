mod logger;

use logger::init_tracing;
use tracing::{error, warn};
use webserver::{Config, Webserver};

#[tokio::main]
async fn main() {
    let _log_guards = init_tracing().expect("Failed to initialise tracing");

    // Try to load a .env file if it exists, a warning is emitted if it doesn't as environment
    // variables may be populated from OS environment.
    match dotenvy::dotenv() {
        Ok(_) => {}
        Err(_) => warn!("No .env file"),
    };

    // Load the config from the environment
    let config = match Config::load_from_env() {
        Ok(config) => config,
        Err(e) => {
            error!("Failed to load config from env:\n{e}");
            return;
        }
    };

    let webserver = match Webserver::create_from_config(&config).await {
        Ok(webserver) => webserver,
        Err(e) => {
            error!("Failed to start the webserver:\n{e}");
            return;
        }
    };

    // Start the webserver
    if let Err(e) = webserver.start().await {
        error!("Failed to start the webserver:\n{e}");
        return;
    }
}
