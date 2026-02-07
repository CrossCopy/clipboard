import test from 'ava'
import {
  availableFormats,
  clear,
  getBuffer,
  getHtml,
  getText,
  hasFiles,
  hasHtml,
  hasImage,
  hasRtf,
  hasText,
  setBuffer,
  setHtml,
  setText,
  startWatch,
} from '../index.js'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Clipboard is global state — all tests must run serially.

// ── Text ─────────────────────────────────────────────────────────────

test.serial('setText / getText round-trips', async (t) => {
  await setText('ava test string')
  t.is(await getText(), 'ava test string')
})

test.serial('hasText returns true after setText', async (t) => {
  await setText('check')
  t.true(hasText())
})

test.serial('setText overwrites previous text', async (t) => {
  await setText('first')
  await setText('second')
  t.is(await getText(), 'second')
})

test.serial('setText handles unicode', async (t) => {
  const unicode = '你好世界 🌍 émojis'
  await setText(unicode)
  t.is(await getText(), unicode)
})

test.serial('setText handles empty string', async (t) => {
  await setText('')
  t.is(await getText(), '')
})

// ── HTML ─────────────────────────────────────────────────────────────

test.serial('setHtml / getHtml round-trips', async (t) => {
  await setHtml('<p>hello</p>')
  t.true(hasHtml())
  const html = await getHtml()
  t.true(html.includes('hello'))
})

// ── Buffer ───────────────────────────────────────────────────────────

test.serial('setBuffer / getBuffer round-trips with custom format', async (t) => {
  const format = 'com.ava.test-format'
  const data = [0x48, 0x65, 0x6c, 0x6c, 0x6f] // "Hello"
  await setBuffer(format, data)
  const result = await getBuffer(format)
  t.deepEqual(Array.from(result), data)
})

// ── Clear ────────────────────────────────────────────────────────────

test.serial('clear removes clipboard content', async (t) => {
  await setText('to be cleared')
  t.true(hasText())
  await clear()
  t.false(hasText())
})

test.serial('clear also removes html', async (t) => {
  await setHtml('<b>gone</b>')
  t.true(hasHtml())
  await clear()
  t.false(hasHtml())
})

// ── availableFormats ─────────────────────────────────────────────────

test.serial('availableFormats returns array', async (t) => {
  await setText('formats test')
  const formats = availableFormats()
  t.true(Array.isArray(formats))
  t.true(formats.length > 0)
})

test.serial('availableFormats is empty after clear', async (t) => {
  await clear()
  const formats = availableFormats()
  t.is(formats.length, 0)
})

// ── has* after clear ─────────────────────────────────────────────────

test.serial('has* all return false after clear', async (t) => {
  await clear()
  t.false(hasText())
  t.false(hasHtml())
  t.false(hasImage())
  t.false(hasFiles())
  t.false(hasRtf())
})

// ── Clipboard Watcher ────────────────────────────────────────────────

test.serial('startWatch returns a watcher with isRunning true', (t) => {
  const watcher = startWatch(() => {})
  t.true(watcher.isRunning)
  watcher.stop()
  t.false(watcher.isRunning)
})

test.serial('stop is idempotent', (t) => {
  const watcher = startWatch(() => {})
  watcher.stop()
  watcher.stop() // second call should not throw
  t.false(watcher.isRunning)
})

test.serial('watcher callback fires on clipboard change', async (t) => {
  let count = 0
  const watcher = startWatch(() => {
    count++
  })

  // Write to clipboard a few times with delays so the OS registers changes
  for (let i = 0; i < 3; i++) {
    await sleep(600)
    await setText(`watcher test ${i}`)
  }

  // Give the last notification time to arrive
  await sleep(1000)

  watcher.stop()
  t.true(count >= 2, `expected at least 2 change events, got ${count}`)
})

test.serial('watcher does not fire after stop', async (t) => {
  let count = 0
  const watcher = startWatch(() => {
    count++
  })

  await sleep(600)
  await setText('before stop')
  await sleep(1000)
  const countAtStop = count

  watcher.stop()

  // Write again after stopping
  await sleep(600)
  await setText('after stop')
  await sleep(1000)

  t.is(count, countAtStop, 'callback should not fire after stop')
})
