import clipboard from "./index";
import fs from "node:fs";
import { base64img } from "./__tests__/data";

(async function () {
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
})();
