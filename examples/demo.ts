import {
  availableFormats,
  getText,
  setText,
  getHtml,
  setHtml,
  hasText,
  hasHtml,
  hasImage,
  hasFiles,
  hasRtf,
  getFiles,
  getImageBase64,
  clear,
  startWatch,
} from '../index.js'

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function section(title: string) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  ${title}`)
  console.log(`${'─'.repeat(60)}`)
}

// ── Read / Write ─────────────────────────────────────────────────────

async function demoReadWrite() {
  section('Read & Write')

  // Text
  await setText('Hello from @crosscopy/clipboard!')
  console.log('hasText:', hasText())
  console.log('getText:', await getText())

  // HTML
  await setHtml('<b>Bold</b>')
  console.log('hasHtml:', hasHtml())
  console.log('getHtml:', await getHtml())

  // Formats & flags
  console.log('hasImage:', hasImage())
  console.log('hasFiles:', hasFiles())
  console.log('hasRtf:', hasRtf())
  console.log('availableFormats:', availableFormats())
}

// ── Image ────────────────────────────────────────────────────────────

async function demoImage() {
  section('Image (read-only check)')

  if (hasImage()) {
    const b64 = await getImageBase64()
    console.log('Image base64 length:', b64.length)
  } else {
    console.log('No image on clipboard — copy one and re-run to test')
  }
}

// ── Files ────────────────────────────────────────────────────────────

async function demoFiles() {
  section('Files (read-only check)')

  if (hasFiles()) {
    console.log('Files:', await getFiles())
  } else {
    console.log('No files on clipboard — copy some and re-run to test')
  }
}

// ── Clipboard Watcher ────────────────────────────────────────────────

async function demoWatcher() {
  section('Clipboard Watcher')

  let changeCount = 0

  const watcher = startWatch(() => {
    changeCount++
    console.log(`  [watcher] clipboard changed (#${changeCount})`)
  })
  console.log('Watcher started, isRunning:', watcher.isRunning)

  // Write to the clipboard a few times to trigger the callback
  console.log('Writing to clipboard 3 times...')
  for (let i = 1; i <= 3; i++) {
    await sleep(600) // small delay so the OS registers a change
    await setText(`change ${i}`)
  }

  // Give the watcher time to deliver the last notification
  await sleep(1000)

  console.log(`Total changes detected: ${changeCount}`)
  console.log('isRunning before stop:', watcher.isRunning)
  watcher.stop()
  console.log('isRunning after stop:', watcher.isRunning)
}

// ── Clear ────────────────────────────────────────────────────────────

async function demoClear() {
  section('Clear')

  await setText('will be cleared')
  console.log('before clear — hasText:', hasText())
  await clear()
  console.log('after  clear — hasText:', hasText())
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('@crosscopy/clipboard — feature demo\n')

  await demoReadWrite()
  await demoImage()
  await demoFiles()
  await demoWatcher()
  await demoClear()

  console.log('\nDone.')
}

main()
