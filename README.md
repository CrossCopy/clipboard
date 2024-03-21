# Clipboard

npm package: https://www.npmjs.com/package/@crosscopy/clipboard
GitHub: https://github.com/crosscopy/clipboard

> This is a clipboard API npm package that allows you to copy and paste data to and from the clipboard.
> There doesn't seem to be a good clipboard package for node.js (that supports data format beyond text), so I decided to make one.
> Data Format Supported
>
> - Text
> - Image
> - Rich Text Format
> - Files
> - HTML

## Acknowledgements

- [ChurchTao/clipboard-rs](https://github.com/ChurchTao/clipboard-rs) is written in rust, which is used to provide the native clipboard support for this package across Linux, Windows and MacOS. This package is basically a wrapper around this rust package.
  - https://crates.io/crates/clipboard-rs
- [napi.rs](https://napi.rs/) was used to create the node.js addon for this package, so that API calls written in rust can be called from node.js.

## API

Detailed API function declarations can be found in the [index.d.ts](./index.d.ts).

Or you can refer to the source code in [src/lib.rs](./src/lib.rs).

## Sample

```javascript
import Clipboard from "@crosscopy/clipboard";

console.log(await Clipboard.getText());

console.log(await Clipboard.getHtml());

if (await Clipboard.hasImage()) {
  console.log(await Clipboard.getImageBase64());
} else {
  console.log("No Image");
}
```

## Plan

A clipboard listener will be added soon for monitoring clipboard changes and get notified when the clipboard content changes.
