# General Clipboard Listener

> A Cross-Platform clipboard listener that listens for both text and image (screenshots).
> Designed for NodeJS, not for web.
> Provides API to read and write text/image from/to clipboard.

npm package: https://www.npmjs.com/package/@crosscopy/clipboard

## Installation

`npm i @crosscopy/clipboard`

## Usage

It has a very easy to use event-based system.

See [demo.ts](./demo.ts) for a demo.

Run `ts-node demo.ts`.

```ts
import clipboardEventListener from "./@crosscopy/clipboard";

console.log(clipboard.readTextSync());
  console.log(await clipboard.readText());
  const imgBuf = clipboard.readImageSync();
  // console.log(imgBuf.toString("base64"));
  // console.log(clipboard.readImageBase64Sync());
  // await clipboard.writeImage(base64img); // add fake image to clipboard
  clipboard.writeImageSync(base64img); // add fake image to clipboard
  console.log(""); // give some time
  console.assert(clipboard.readImageBase64Sync() === base64img);

  // * test readimage
  clipboard.writeImageSync(base64img);
  console.log();
  console.assert(
    (await clipboard.readImage()).toString("base64") === base64img
  );

  await clipboard.writeImage(base64img);
  console.log();
  console.assert((await clipboard.readImageBase64()) === base64img);
  clipboard.on("text", (text) => {
    console.log(text);
  });
  clipboard.on("image", (data) => {
    fs.writeFileSync("test.png", data);
  });
  clipboard.listen();
  setTimeout(() => {
    clipboard.close();
  }, 10000);
```

## Explanation

It's achieved using child process + `stdout`. 

I took a golang version of the listener from [golang-design/clipboard](https://github.com/golang-design/clipboard). 

When a change is detected, `IMAGE_CHANGED` or `TEXT_CHANGED` is printed to `stdout`. 

This library runs compiled go-version clipboard listener using child process and listen to the `stdout`.

If it sees the keywords in child process's `stdout`, an event will be emitted. 

Run `npm run demo` to see a demo for 10 sec. Once started, copy some text and screenshot and check the terminal.


## Supported Platforms

Format: `process.platform/process.arch`

The process here is from nodejs.

Supported platforms can be found in `go-clipboard/binaries`.

If your nodejs gives different platform or arch, it may not work.

## Release

Cross Compile doesn't work due to some CGO problem. Have to build on different platforms manually.

Within `go-clipboard` folder.

```bash
go build -o binaries/go-clipboard-darwin-arm64
go build -o binaries/go-clipboard-darwin-x64
go build -o binaries/go-clipboard-win32-x64.exe
go build -o binaries/go-clipboard-linux-x64
go build -o binaries/go-clipboard-linux-arm
go build -o binaries/go-clipboard-linux-arm64
```