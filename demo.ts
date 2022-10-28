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
