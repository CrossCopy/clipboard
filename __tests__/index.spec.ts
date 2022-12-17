import cb from "../index";
import { base64img } from "./data";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Test Clipboard Read and Write", () => {
  it("Synchronous Clipboard Text Methods", async () => {
    cb.writeTextSync("abc");
    const text = cb.readTextSync();
    expect(text).toBe("abc");
  });

  it("Async Clipboard Text", async () => {
    await cb.writeText("def");
    expect(await cb.readText()).toBe("def");
  });

  if (process.platform !== "win32") {
    // on windows, clipboard image is altered before and after. Look the same though.
      it("Synchronous Clipboard Image Methods", async () => {
        cb.writeImageSync(base64img);
        expect(cb.readImageBase64Sync()).toBe(base64img);
        cb.writeImageSync(base64img);
        expect(cb.readImageSync().toString("base64")).toBe(base64img);
      });
    
      it("Asynchronous Cliipboard Image Methods", async () => {
        await cb.writeImage(base64img);
        expect(await cb.readImageBase64()).toBe(base64img);
        await cb.writeImage(base64img);
        expect((await cb.readImage()).toString("base64")).toBe(base64img);
      });
  }
});
