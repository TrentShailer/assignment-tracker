use tracing::{
    subscriber::{set_global_default, SetGlobalDefaultError},
    Level,
};
use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::layer::SubscriberExt;

pub fn init_tracing() -> Result<[WorkerGuard; 2], SetGlobalDefaultError> {
    let filter = tracing_subscriber::filter::Targets::new().with_default(Level::INFO);

    // file logger
    let file_appender = tracing_appender::rolling::daily("logs", "rolling.log");
    let (file_writer, _file_guard) = tracing_appender::non_blocking(file_appender);

    let file_logger = tracing_subscriber::fmt::layer()
        .with_writer(file_writer)
        .with_ansi(false)
        .with_target(false);

    // stdout logger
    let (std_writer, _std_guard) = tracing_appender::non_blocking(std::io::stdout());
    let std_logger = tracing_subscriber::fmt::layer()
        .with_writer(std_writer)
        .with_ansi(false)
        .with_target(false);

    // Register loggers
    let collector = tracing_subscriber::registry()
        .with(file_logger)
        .with(std_logger)
        .with(filter);

    set_global_default(collector)?;

    Ok([_file_guard, _std_guard])
}
