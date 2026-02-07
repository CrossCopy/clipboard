# Clipboard

[![NPM Version](https://img.shields.io/npm/v/@crosscopy/clipboard)](https://www.npmjs.com/package/@crosscopy/clipboard)
[![CI](https://github.com/CrossCopy/clipboard/actions/workflows/CI.yml/badge.svg)](https://github.com/CrossCopy/clipboard/actions/workflows/CI.yml)

**NPM Package**: https://www.npmjs.com/package/@crosscopy/clipboard

**GitHub**: https://github.com/crosscopy/clipboard

Cross-platform native clipboard for Node.js. Read, write, and watch the system clipboard with support for multiple data formats.

### Supported Formats

- Text
- HTML
- Rich Text (RTF)
- Images (PNG binary / base64)
- Files
- Arbitrary binary buffers (custom format strings)

## Install

```bash
npm install @crosscopy/clipboard
# or
yarn add @crosscopy/clipboard
```

## Quick Start

```typescript
import {
  getText, setText,
  hasText, hasImage,
  getImageBase64,
  startWatch,
} from '@crosscopy/clipboard'

// Read & write text
await setText('hello world')
console.log(await getText()) // "hello world"

// Check what's on the clipboard
console.log(hasText())  // true
console.log(hasImage()) // false

// Watch for changes
const watcher = startWatch(() => {
  console.log('clipboard changed!')
})
// ... later
watcher.stop()
```

## API

Full type declarations are in [`index.d.ts`](./index.d.ts).

### Text

| Function | Signature | Description |
|---|---|---|
| `hasText` | `() => boolean` | Check if clipboard contains text |
| `getText` | `() => Promise<string>` | Read text from clipboard |
| `setText` | `(text: string) => Promise<void>` | Write text to clipboard |

```typescript
import { hasText, getText, setText } from '@crosscopy/clipboard'

await setText('copied!')
if (hasText()) {
  console.log(await getText())
}
```

### HTML

| Function | Signature | Description |
|---|---|---|
| `hasHtml` | `() => boolean` | Check if clipboard contains HTML |
| `getHtml` | `() => Promise<string>` | Read HTML string from clipboard |
| `setHtml` | `(html: string) => Promise<void>` | Write HTML string to clipboard |

```typescript
import { setHtml, getHtml } from '@crosscopy/clipboard'

await setHtml('<b>bold</b>')
console.log(await getHtml())
```

### Rich Text (RTF)

| Function | Signature | Description |
|---|---|---|
| `hasRtf` | `() => boolean` | Check if clipboard contains RTF |
| `getRtf` | `() => Promise<string>` | Read RTF string from clipboard |
| `setRtf` | `(rtf: string) => Promise<void>` | Write RTF string to clipboard |

### Image

| Function | Signature | Description |
|---|---|---|
| `hasImage` | `() => boolean` | Check if clipboard contains an image |
| `getImageBinary` | `() => Promise<Array<number>>` | Read image as PNG bytes |
| `getImageBase64` | `() => Promise<string>` | Read image as base64-encoded PNG |
| `setImageBinary` | `(imageBytes: Array<number>) => Promise<void>` | Write PNG bytes to clipboard |
| `setImageBase64` | `(base64Str: string) => Promise<void>` | Write base64-encoded PNG to clipboard |

```typescript
import { hasImage, getImageBase64, setImageBinary } from '@crosscopy/clipboard'
import { readFileSync } from 'fs'

// Write a PNG file to clipboard
const png = readFileSync('screenshot.png')
await setImageBinary(Array.from(png))

// Read as base64
if (hasImage()) {
  const b64 = await getImageBase64()
  console.log(`data:image/png;base64,${b64}`)
}
```

### Files

| Function | Signature | Description |
|---|---|---|
| `hasFiles` | `() => boolean` | Check if clipboard contains file references |
| `getFiles` | `() => Promise<Array<string>>` | Read file paths from clipboard |
| `setFiles` | `(files: Array<string>) => Promise<void>` | Write file paths to clipboard |

```typescript
import { hasFiles, getFiles } from '@crosscopy/clipboard'

if (hasFiles()) {
  const paths = await getFiles()
  console.log(paths) // ["/Users/you/file.txt", ...]
}
```

### Buffer (Custom Formats)

| Function | Signature | Description |
|---|---|---|
| `getBuffer` | `(format: string) => Promise<Array<number>>` | Read raw bytes for a given format |
| `setBuffer` | `(format: string, buffer: Array<number>) => Promise<void>` | Write raw bytes for a given format |

```typescript
import { setBuffer, getBuffer } from '@crosscopy/clipboard'

await setBuffer('com.myapp.custom', [0x01, 0x02, 0x03])
const data = await getBuffer('com.myapp.custom')
```

### Utilities

| Function | Signature | Description |
|---|---|---|
| `availableFormats` | `() => Array<string>` | List all format types currently on the clipboard |
| `clear` | `() => Promise<void>` | Clear the clipboard |

### Clipboard Watcher

Monitor clipboard changes using OS-native notifications.

| Function / Method | Signature | Description |
|---|---|---|
| `startWatch` | `(callback: () => void) => ClipboardWatcherJs` | Start watching; returns a handle |
| `watcher.stop()` | `() => void` | Stop the watcher |
| `watcher.isRunning` | `boolean` (getter) | Whether the watcher is active |

```typescript
import { startWatch, getText } from '@crosscopy/clipboard'

const watcher = startWatch(async () => {
  console.log('changed:', await getText())
})

console.log(watcher.isRunning) // true

// Stop when done
watcher.stop()
console.log(watcher.isRunning) // false
```

The watcher runs on a background thread using native clipboard change events — there is no polling from JavaScript. Call `stop()` to clean up.

## Platform Support

| Platform | Architectures |
|---|---|
| macOS | x64, arm64 (Apple Silicon), universal |
| Windows | x64, arm64 |
| Linux | x64 (glibc) |

## Acknowledgements

- [ChurchTao/clipboard-rs](https://github.com/ChurchTao/clipboard-rs) provides the native clipboard support across Linux, Windows, and macOS.
- [napi.rs](https://napi.rs/) bridges the Rust implementation to Node.js.

## Publish

Everything is done with GitHub Actions.

Run `npm version patch` to bump the version, then `git push --follow-tags`. GitHub Actions will build and publish automatically.
