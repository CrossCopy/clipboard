# Clipboard

[![NPM Version](https://img.shields.io/npm/v/@crosscopy/clipboard)](https://www.npmjs.com/package/@crosscopy/clipboard)
[![CI](https://github.com/CrossCopy/clipboard/actions/workflows/CI.yml/badge.svg)](https://github.com/CrossCopy/clipboard/actions/workflows/CI.yml)

**NPM Package**: https://www.npmjs.com/package/@crosscopy/clipboard

**GitHub**: https://github.com/crosscopy/clipboard

跨平台原生剪贴板库，适用于 Node.js。支持读取、写入和监听系统剪贴板，兼容多种数据格式。

### 支持的格式

- 纯文本
- HTML
- 富文本 (RTF)
- 图片 (PNG 二进制 / base64)
- 文件
- 任意二进制数据 (自定义格式字符串)

## 安装

```bash
npm install @crosscopy/clipboard
# 或
pnpm add @crosscopy/clipboard
```

## 快速开始

```typescript
import {
  getText, setText,
  hasText, hasImage,
  getImageBase64,
  startWatch,
} from '@crosscopy/clipboard'

// 读写文本
await setText('hello world')
console.log(await getText()) // "hello world"

// 检查剪贴板内容类型
console.log(hasText())  // true
console.log(hasImage()) // false

// 监听剪贴板变化
const watcher = startWatch(() => {
  console.log('剪贴板内容已变化！')
})
// ... 之后停止监听
watcher.stop()
```

## API

完整的类型声明请参阅 [`index.d.ts`](./index.d.ts)。

### 纯文本

| 函数 | 签名 | 说明 |
|---|---|---|
| `hasText` | `() => boolean` | 检查剪贴板是否包含文本 |
| `getText` | `() => Promise<string>` | 从剪贴板读取文本 |
| `setText` | `(text: string) => Promise<void>` | 将文本写入剪贴板 |

```typescript
import { hasText, getText, setText } from '@crosscopy/clipboard'

await setText('已复制！')
if (hasText()) {
  console.log(await getText())
}
```

### HTML

| 函数 | 签名 | 说明 |
|---|---|---|
| `hasHtml` | `() => boolean` | 检查剪贴板是否包含 HTML |
| `getHtml` | `() => Promise<string>` | 从剪贴板读取 HTML 字符串 |
| `setHtml` | `(html: string) => Promise<void>` | 将 HTML 字符串写入剪贴板 |

```typescript
import { setHtml, getHtml } from '@crosscopy/clipboard'

await setHtml('<b>粗体</b>')
console.log(await getHtml())
```

### 富文本 (RTF)

| 函数 | 签名 | 说明 |
|---|---|---|
| `hasRtf` | `() => boolean` | 检查剪贴板是否包含 RTF |
| `getRtf` | `() => Promise<string>` | 从剪贴板读取 RTF 字符串 |
| `setRtf` | `(rtf: string) => Promise<void>` | 将 RTF 字符串写入剪贴板 |

### 图片

| 函数 | 签名 | 说明 |
|---|---|---|
| `hasImage` | `() => boolean` | 检查剪贴板是否包含图片 |
| `getImageBinary` | `() => Promise<Array<number>>` | 以 PNG 字节数组形式读取图片 |
| `getImageBase64` | `() => Promise<string>` | 以 base64 编码的 PNG 形式读取图片 |
| `setImageBinary` | `(imageBytes: Array<number>) => Promise<void>` | 将 PNG 字节数组写入剪贴板 |
| `setImageBase64` | `(base64Str: string) => Promise<void>` | 将 base64 编码的 PNG 写入剪贴板 |

```typescript
import { hasImage, getImageBase64, setImageBinary } from '@crosscopy/clipboard'
import { readFileSync } from 'fs'

// 将 PNG 文件写入剪贴板
const png = readFileSync('screenshot.png')
await setImageBinary(Array.from(png))

// 以 base64 形式读取
if (hasImage()) {
  const b64 = await getImageBase64()
  console.log(`data:image/png;base64,${b64}`)
}
```

### 文件

| 函数 | 签名 | 说明 |
|---|---|---|
| `hasFiles` | `() => boolean` | 检查剪贴板是否包含文件引用 |
| `getFiles` | `() => Promise<Array<string>>` | 从剪贴板读取文件路径列表 |
| `setFiles` | `(files: Array<string>) => Promise<void>` | 将文件路径列表写入剪贴板 |

```typescript
import { hasFiles, getFiles } from '@crosscopy/clipboard'

if (hasFiles()) {
  const paths = await getFiles()
  console.log(paths) // ["/Users/you/file.txt", ...]
}
```

### Buffer (自定义格式)

| 函数 | 签名 | 说明 |
|---|---|---|
| `getBuffer` | `(format: string) => Promise<Array<number>>` | 按指定格式读取原始字节 |
| `setBuffer` | `(format: string, buffer: Array<number>) => Promise<void>` | 按指定格式写入原始字节 |

```typescript
import { setBuffer, getBuffer } from '@crosscopy/clipboard'

await setBuffer('com.myapp.custom', [0x01, 0x02, 0x03])
const data = await getBuffer('com.myapp.custom')
```

### 工具函数

| 函数 | 签名 | 说明 |
|---|---|---|
| `availableFormats` | `() => Array<string>` | 列出剪贴板中当前所有的数据格式 |
| `clear` | `() => Promise<void>` | 清空剪贴板 |

### 剪贴板监听

使用操作系统原生通知机制监听剪贴板变化。

| 函数 / 方法 | 签名 | 说明 |
|---|---|---|
| `startWatch` | `(callback: () => void) => ClipboardWatcherJs` | 开始监听，返回监听句柄 |
| `watcher.stop()` | `() => void` | 停止监听 |
| `watcher.isRunning` | `boolean` (getter) | 监听器是否正在运行 |

```typescript
import { startWatch, getText } from '@crosscopy/clipboard'

const watcher = startWatch(async () => {
  console.log('剪贴板已变化:', await getText())
})

console.log(watcher.isRunning) // true

// 不再需要时停止监听
watcher.stop()
console.log(watcher.isRunning) // false
```

监听器在后台线程中运行，使用操作系统原生的剪贴板变化事件，JavaScript 侧无需轮询。使用完毕后调用 `stop()` 释放资源。

## 平台支持

| 平台 | 架构 |
|---|---|
| macOS | x64, arm64 (Apple Silicon), universal |
| Windows | x64, arm64 |
| Linux | x64 (glibc) |

## 致谢

- [ChurchTao/clipboard-rs](https://github.com/ChurchTao/clipboard-rs) 提供了跨 Linux、Windows 和 macOS 的原生剪贴板支持。
- [napi.rs](https://napi.rs/) 将 Rust 实现桥接到 Node.js。

## 发布

所有构建和发布流程由 GitHub Actions 完成。

执行 `npm version patch` 升级版本号，然后 `git push --follow-tags` 推送到 GitHub，GitHub Actions 会自动构建并发布。
