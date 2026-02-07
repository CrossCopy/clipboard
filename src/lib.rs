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

#[napi]
pub fn available_formats() -> Vec<String> {
  let ctx = ClipboardContext::new().unwrap();
  ctx.available_formats().unwrap()
}

#[napi]
pub fn has_text() -> bool {
  let ctx = ClipboardContext::new().unwrap();
  ctx.has(ContentFormat::Text)
}

#[napi]
pub async fn get_text() -> String {
  let ctx = ClipboardContext::new().unwrap();
  ctx.get_text().unwrap()
}

#[napi]
pub async fn set_text(text: String) {
  let ctx = ClipboardContext::new().unwrap();
  ctx.set_text(text).unwrap()
}

#[napi]
pub fn has_html() -> bool {
  let ctx = ClipboardContext::new().unwrap();
  ctx.has(ContentFormat::Html)
}

#[napi]
pub async fn get_html() -> String {
  let ctx = ClipboardContext::new().unwrap();
  ctx.get_html().unwrap()
}

#[napi]
pub async fn set_html(html: String) {
  let ctx = ClipboardContext::new().unwrap();
  ctx.set_html(html).unwrap()
}

#[napi]
pub fn has_rtf() -> bool {
  let ctx = ClipboardContext::new().unwrap();
  ctx.has(ContentFormat::Rtf)
}

#[napi]
pub async fn get_rtf() -> String {
  let ctx = ClipboardContext::new().unwrap();
  ctx.get_rich_text().unwrap()
}

#[napi]
pub async fn set_rtf(rtf: String) {
  let ctx = ClipboardContext::new().unwrap();
  ctx.set_rich_text(rtf).unwrap()
}

#[napi]
pub fn has_image() -> bool {
  let ctx = ClipboardContext::new().unwrap();
  ctx.has(ContentFormat::Image)
}

#[napi]
pub async fn get_image_binary() -> Vec<u8> {
  let ctx = ClipboardContext::new().unwrap();
  let image = ctx.get_image().unwrap();
  image.to_png().unwrap().get_bytes().to_vec()
}

#[napi]
pub async fn get_image_base64() -> String {
  let image_bytes = get_image_binary().await;
  general_purpose::STANDARD_NO_PAD.encode(&image_bytes)
}

#[napi]
pub async fn set_image_binary(image_bytes: Vec<u8>) {
  let ctx = ClipboardContext::new().unwrap();
  let img = RustImageData::from_bytes(&image_bytes).unwrap();
  ctx.set_image(img).unwrap()
}

#[napi]
pub async fn set_image_base64(base64_str: String) {
  let decoded: Vec<u8> = general_purpose::STANDARD_NO_PAD.decode(base64_str).unwrap();
  set_image_binary(decoded).await;
}

#[napi]
pub fn has_files() -> bool {
  let ctx = ClipboardContext::new().unwrap();
  ctx.has(ContentFormat::Files)
}

#[napi]
pub async fn get_files() -> Vec<String> {
  let ctx = ClipboardContext::new().unwrap();
  ctx.get_files().unwrap()
}

#[napi]
pub async fn set_files(files: Vec<String>) {
  let ctx = ClipboardContext::new().unwrap();
  ctx.set_files(files).unwrap()
}

#[napi]
pub async fn get_buffer(format: String) -> Vec<u8> {
  let ctx = ClipboardContext::new().unwrap();
  ctx.get_buffer(&format).unwrap()
}

#[napi]
pub async fn set_buffer(format: String, buffer: Vec<u8>) {
  let ctx = ClipboardContext::new().unwrap();
  ctx.set_buffer(&format, buffer).unwrap()
}

#[napi]
pub async fn clear() {
  let ctx = ClipboardContext::new().unwrap();
  ctx.clear().unwrap()
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
    let mut guard = self.shutdown.lock().unwrap();
    if let Some(shutdown) = guard.take() {
      shutdown.stop();
    }
    Ok(())
  }

  #[napi(getter)]
  pub fn is_running(&self) -> bool {
    let guard = self.shutdown.lock().unwrap();
    guard.is_some()
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
