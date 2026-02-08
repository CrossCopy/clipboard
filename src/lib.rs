#![deny(clippy::all)]
use base64::{engine::general_purpose, Engine as _};
use clipboard_rs::{
  common::RustImage, Clipboard, ClipboardContext, ClipboardHandler, ClipboardWatcher,
  ClipboardWatcherContext, ContentFormat, RustImageData, WatcherShutdown,
};
use napi::bindgen_prelude::*;
use napi::threadsafe_function::{ThreadsafeCallContext, ThreadsafeFunctionCallMode};
use napi_derive::napi;
use std::sync::{Arc, Mutex};

/// Helper to convert clipboard_rs errors into napi errors.
fn cb_err(e: impl std::fmt::Display) -> Error {
  Error::new(Status::GenericFailure, e.to_string())
}

#[napi]
pub fn available_formats() -> Result<Vec<String>> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.available_formats().map_err(cb_err)
}

#[napi]
pub fn has_text() -> Result<bool> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  Ok(ctx.has(ContentFormat::Text))
}

#[napi]
pub async fn get_text() -> Result<String> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.get_text().map_err(cb_err)
}

#[napi]
pub async fn set_text(text: String) -> Result<()> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.set_text(text).map_err(cb_err)
}

#[napi]
pub fn has_html() -> Result<bool> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  Ok(ctx.has(ContentFormat::Html))
}

#[napi]
pub async fn get_html() -> Result<String> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.get_html().map_err(cb_err)
}

#[napi]
pub async fn set_html(html: String) -> Result<()> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.set_html(html).map_err(cb_err)
}

#[napi]
pub fn has_rtf() -> Result<bool> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  Ok(ctx.has(ContentFormat::Rtf))
}

#[napi]
pub async fn get_rtf() -> Result<String> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.get_rich_text().map_err(cb_err)
}

#[napi]
pub async fn set_rtf(rtf: String) -> Result<()> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.set_rich_text(rtf).map_err(cb_err)
}

#[napi]
pub fn has_image() -> Result<bool> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  Ok(ctx.has(ContentFormat::Image))
}

#[napi]
pub async fn get_image_binary() -> Result<Vec<u8>> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  let image = ctx.get_image().map_err(cb_err)?;
  let png = image.to_png().map_err(cb_err)?;
  Ok(png.get_bytes().to_vec())
}

#[napi]
pub async fn get_image_base64() -> Result<String> {
  let image_bytes = get_image_binary().await?;
  Ok(general_purpose::STANDARD_NO_PAD.encode(&image_bytes))
}

#[napi]
pub async fn set_image_binary(image_bytes: Vec<u8>) -> Result<()> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  let img = RustImageData::from_bytes(&image_bytes).map_err(cb_err)?;
  ctx.set_image(img).map_err(cb_err)
}

#[napi]
pub async fn set_image_base64(base64_str: String) -> Result<()> {
  let decoded: Vec<u8> = general_purpose::STANDARD_NO_PAD
    .decode(base64_str)
    .map_err(cb_err)?;
  set_image_binary(decoded).await
}

#[napi]
pub fn has_files() -> Result<bool> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  Ok(ctx.has(ContentFormat::Files))
}

#[napi]
pub async fn get_files() -> Result<Vec<String>> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.get_files().map_err(cb_err)
}

#[napi]
pub async fn set_files(files: Vec<String>) -> Result<()> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.set_files(files).map_err(cb_err)
}

#[napi]
pub async fn get_buffer(format: String) -> Result<Vec<u8>> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.get_buffer(&format).map_err(cb_err)
}

#[napi]
pub async fn set_buffer(format: String, buffer: Vec<u8>) -> Result<()> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.set_buffer(&format, buffer).map_err(cb_err)
}

#[napi]
pub async fn clear() -> Result<()> {
  let ctx = ClipboardContext::new().map_err(cb_err)?;
  ctx.clear().map_err(cb_err)
}

// ============================================================================
// Clipboard Watching
// ============================================================================

struct CallbackHandler {
  on_change: Arc<dyn Fn() + Send + Sync>,
}

impl ClipboardHandler for CallbackHandler {
  fn on_clipboard_change(&mut self) {
    (self.on_change)();
  }
}

#[napi]
pub struct ClipboardWatcherJs {
  shutdown: Arc<Mutex<Option<WatcherShutdown>>>,
}

#[napi]
impl ClipboardWatcherJs {
  #[napi]
  pub fn stop(&self) -> Result<()> {
    let mut guard = self
      .shutdown
      .lock()
      .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
    if let Some(shutdown) = guard.take() {
      shutdown.stop();
    }
    Ok(())
  }

  #[napi(getter)]
  pub fn is_running(&self) -> bool {
    let guard = self.shutdown.lock();
    match guard {
      Ok(g) => g.is_some(),
      Err(_) => false,
    }
  }
}

/// Start watching the clipboard for changes.
/// The callback is invoked whenever the clipboard content changes.
/// Returns a `ClipboardWatcherJs` handle that can stop the watcher.
#[napi(ts_return_type = "ClipboardWatcherJs")]
pub fn start_watch(
  #[napi(ts_arg_type = "() => void")] callback: Function<(), ()>,
) -> Result<ClipboardWatcherJs> {
  let tsfn = callback
    .build_threadsafe_function()
    .build_callback(|_ctx: ThreadsafeCallContext<()>| Ok::<Vec<()>, napi::Error>(vec![]))?;

  let on_change: Arc<dyn Fn() + Send + Sync> = Arc::new(move || {
    let _ = tsfn.call((), ThreadsafeFunctionCallMode::NonBlocking);
  });

  let handler = CallbackHandler { on_change };
  let mut watcher = ClipboardWatcherContext::new().map_err(|e| {
    Error::new(
      Status::GenericFailure,
      format!("Failed to create clipboard watcher: {}", e),
    )
  })?;
  watcher.add_handler(handler);

  let shutdown = watcher.get_shutdown_channel();
  std::thread::spawn(move || {
    watcher.start_watch();
  });

  Ok(ClipboardWatcherJs {
    shutdown: Arc::new(Mutex::new(Some(shutdown))),
  })
}
