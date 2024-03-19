#![deny(clippy::all)]
use base64::{engine::general_purpose, Engine as _};
use clipboard_rs::{common::RustImage, Clipboard, ClipboardContext, ContentFormat, RustImageData};

#[macro_use]
extern crate napi_derive;

#[napi]
pub fn sum(a: i32, b: i32) -> i32 {
  a + b
}

#[napi]
pub fn available_formats() -> Vec<String> {
  let ctx = ClipboardContext::new().unwrap();
  let types = ctx.available_formats().unwrap();
  types
}

#[napi]
pub fn get_text() -> String {
  let ctx = ClipboardContext::new().unwrap();
  ctx.get_text().unwrap()
}

#[napi]
async fn get_text_async() -> String {
  let ctx = ClipboardContext::new().unwrap();
  ctx.get_text().unwrap()
}

#[napi]
pub fn set_text(text: String) {
  let ctx = ClipboardContext::new().unwrap();
  ctx.set_text(text).unwrap()
}

#[napi]
pub fn get_image_base64() -> String {
  let ctx = ClipboardContext::new().unwrap();
  let image = ctx.get_image().unwrap();
  let image_bytes = image.to_png().unwrap().get_bytes().to_vec();
  let base64_str = general_purpose::STANDARD_NO_PAD.encode(&image_bytes);
  base64_str
}

#[napi]
pub fn set_image_base64(base64_str: String) {
  let ctx = ClipboardContext::new().unwrap();
  let decoded: Vec<u8> = general_purpose::STANDARD_NO_PAD.decode(base64_str).unwrap();
  let img = RustImageData::from_bytes(&decoded).unwrap();
  ctx.set_image(img).unwrap()
}
