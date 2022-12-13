import cb from "../index";
import { base64img } from "./data";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Test Text Clipboard", () => {
  it("Synchronous Clipboard Text Methods", async () => {
    cb.writeTextSync("abc");
    await sleep(100);
    const text = cb.readTextSync();
    expect(text).toBe("abc");
  });

  it("Async Clipboard Text", async () => {
    await cb.writeText("def");
    await sleep(100);
    expect(await cb.readText()).toBe("def");
  });

  it("Synchronous Cliipboard Image Methods", async () => {
    cb.writeImageSync(base64img);
    await sleep(100);
    expect(cb.readImageBase64Sync()).toBe(base64img);
    cb.writeImageSync(base64img);
    await sleep(100);
    expect((cb.readImageSync()).toString("base64")).toBe(base64img);
  });

  it("Asynchronous Cliipboard Image Methods", async () => {
    await cb.writeImage(base64img);
    await sleep(100);
    expect(await cb.readImageBase64()).toBe(base64img);
    await cb.writeImage(base64img);
    await sleep(100);
    expect((await cb.readImage()).toString("base64")).toBe(base64img);
  });
});
