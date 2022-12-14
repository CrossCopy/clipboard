import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import net from "net";
import { execFile, ChildProcess, execFileSync } from "node:child_process";
import util from "util";
import { base64BufToUTF8, base64StringToUTF8 } from "./src/util";
import { ClipboardOperation, WatchEvent } from "./src/constants";

const execFileAsync = util.promisify(execFile);

export class Clipboard {
  child: ChildProcess | undefined;
  server: net.Server | undefined;
  emitter: EventEmitter;

  constructor() {
    this.child = undefined;
    this.emitter = new EventEmitter();
  }

  get exeFilename(): string {
    const { platform, arch } = process;
    let exeFilename = `go-clipboard-${platform}-${arch}`;
    if (platform === "win32") {
      exeFilename += ".exe";
    }
    return exeFilename;
  }

  get goClipboardPath(): string {
    const pathArr = [__dirname];

    if (path.basename(__dirname) === "dist") {
      pathArr.push("..");
    }

    pathArr.push(...["go-clipboard", "binaries", this.exeFilename]);
    const exePath = path.join(...pathArr);
    return exePath;
  }

  readText(): Promise<string> {
    return execFileAsync(this.goClipboardPath, [
      ClipboardOperation.READ_TEXT,
    ]).then((result) => {
      return base64StringToUTF8(result.stdout);
    });
  }

  readTextSync(): string {
    const buf = execFileSync(this.goClipboardPath, [
      ClipboardOperation.READ_TEXT,
    ]);
    return base64BufToUTF8(buf);
  }

  writeText(content: string): Promise<void> {
    return Promise.resolve(this.writeTextSync(content));
  }

  writeTextSync(content: string): void {
    const writeTextProcess = execFile(this.goClipboardPath, [
      ClipboardOperation.WRITE_TEXT,
    ]);
    writeTextProcess.stdin?.write(content);
    writeTextProcess.stdin?.end();
  }

  writeImageSync(base64ImgStr: string): void;
  writeImageSync(imgBuf: Buffer): void;
  writeImageSync(data: string | Buffer): void {
    if (data instanceof String || typeof data === "string") {
      const writeImageProcess = execFile(this.goClipboardPath, [
        ClipboardOperation.WRITE_IMAGE,
      ]);
      writeImageProcess.stdin?.write(data);
      writeImageProcess.stdin?.end();
      // writeImageProcess.stdout?.on("data", (data_) => {
      //   console.log(data_);
      // });
    } else if (data instanceof Buffer) {
      this.writeImageSync(data.toString("base64"));
    } else {
      throw new Error("Invalid Data Type. Has to be string or Buffer");
    }
  }
  writeImage(data: string): Promise<void>;
  writeImage(data: Buffer): Promise<void>;
  writeImage(data: string | Buffer): Promise<void> {
    if (data instanceof String || typeof data === "string") {
      return Promise.resolve(this.writeImageSync(data as string));
    } else if (data instanceof Buffer) {
      return Promise.resolve(this.writeImageSync(data as Buffer));
    } else {
      throw new Error("Invalid Data Type. Has to be string or Buffer");
    }
  }

  readImage(): Promise<Buffer> {
    return Promise.resolve(this.readImageSync());
  }

  readImageBase64(): Promise<string> {
    return Promise.resolve(this.readImageBase64Sync());
  }

  readImageSync(): Buffer {
    const buf = execFileSync(this.goClipboardPath, [
      ClipboardOperation.READ_IMAGE,
    ]);
    const stdoutStr = buf.toString();
    const imgBuf = Buffer.from(stdoutStr, "base64");
    fs.writeFileSync("test.png", imgBuf);
    return imgBuf;
  }

  readImageBase64Sync(): string {
    return this.readImageSync().toString("base64");
  }

  listen() {
    this.server = net.createServer((con) => {
      // client connected
      let data = "";

      // * demo of sending message to client,
      // con.write("close");

      /**
       * Accumulate data by concatenating chunks of received data
       */
      con.on("data", (packet) => {
        data += packet.toString();
      });

      /**
       * When socket connection closes, wrap up received data
       */
      con.on("close", () => {
        const strData = data.toString();
        const subStr = strData.substring(0, 14);
        if (subStr.includes(`${WatchEvent.TEXT_CHANGED}:`)) {
          const text = Buffer.from(strData.substring(13), "base64").toString();
          this.emitter.emit("text", text);
        } else if (subStr.includes(`${WatchEvent.IMAGE_CHANGED}:`)) {
          const data = strData.substring(14) as string;
          this.emitter.emit("image", Buffer.from(data, "base64"));
          // const imageBase64 = data.toString("base64");
          // console.log(`Image Changed`);
          // fs.writeFileSync("test.png", Buffer.from(data, "base64"));
        }
      });
    });

    this.server.listen(19559, () => {
      const addr = this.server?.address();
      if (!addr)
        throw new Error("Unexpected Error: TCP Socket Server not Started");
      const port = (addr as net.AddressInfo).port;
      this.child = execFile(this.goClipboardPath, [port.toString()]);
      // this.child.stdout?.on("data", (data) => {
      //   console.log("Received data from client socket stdout:\n" + data);
      // });
    });
  }

  close() {
    this.emitter.emit("close");
    this.emitter.removeAllListeners();
    this.server?.close();
    const res = this.child?.kill();
    return res;
  }

  on(event: "text", cb: TextCallback): void;
  on(event: "image", cb: ImageCallback): void;
  on(event: "close", cb: () => void): void;
  on(
    event: "text" | "image" | "close",
    cb: ImageCallback | TextCallback
  ): void {
    this.emitter.on(event, cb);
  }
}

type TextCallback = (data: string) => void;
type ImageCallback = (data: Buffer) => void;

export default new Clipboard();
