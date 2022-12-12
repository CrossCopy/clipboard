import clipboard from "./index";
import fs from "node:fs";

const base64img =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAgACADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDumIVSx6AZrD0LxPba9d3sFujD7K+xie5rVvpPJsJ5P7qE/pXn3woXdY6rfdWluWNcEYpxbOlvVI9JormvDPioa/eahbGHy3tJNh966WpaadmUnfYy/ESzP4fvVgUtK0TBQOpOK8s8Kaj4q8P6MbC38PPJlifMbjOa9npMD0FXGdlaxLjd3ueFeDr/AMTReJtRjsrSPzpJd1yr/wAHPavc4S5hQyDD4G761mWXh6xsNWudSgQrPcffPY1rUVJqT0CEWkf/2Q==";

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
