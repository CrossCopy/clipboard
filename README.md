# General Clipboard Listener

> A Cross-Platform clipboard listener that listens for both text and image (screenshots).

npm package: https://www.npmjs.com/package/general-clipboard-listener

## Installation

`npm i general-clipboard-listener`

## Usage

It has a very easy to use event-based system.

See [demo.ts](./demo.ts) for a demo.

Run `ts-node demo.ts`.

```ts
import clipboardEventListener from "./index";

clipboardEventListener.on("text", () => {
  console.log("Clipboard Text Updated");
});

clipboardEventListener.on("image", () => {
  console.log("Clipboard Image Updated");
});

clipboardEventListener.on("open", (data) => {
  console.log(data);
});

clipboardEventListener.startListening();

setTimeout(() => {
  clipboardEventListener.stopListening();
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

Supported platforms can be found in `go-clipboard-monitor`.

If your nodejs gives different platform or arch, it may not work.