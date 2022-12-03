# General Clipboard Listener

> This is a cross-platform clipboard listener for both text and image (screenshots).

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