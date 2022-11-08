# General Clipboard Listener

npm package: https://www.npmjs.com/package/general-clipboard-listener

A Cross-Platform clipboard listener that listens for both text and image.

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
