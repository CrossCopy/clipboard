import fs from "node:fs";
import path from "node:path";
// import { EventEmitter } from "events";
import { EventEmitter } from "node:events";
import net from "net";
import {
  spawn,
  execFile,
  ChildProcessWithoutNullStreams,
  ChildProcess,
  execFileSync,
} from "node:child_process";
import util from "util";

const execFileAsync = util.promisify(execFile);

const base64StringToUTF8 = (base64Str: string) => {
  const base64buf = Buffer.from(base64Str, "base64"); // parse base64 string to buffer
  const text = base64buf.toString("utf8"); // base64 buffer to utf-8 string
  return text;
};

const base64BufToUTF8 = (buf: Buffer): string => {
  const base64Text = buf.toString();
  return base64StringToUTF8(base64Text);
};

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
    return execFileAsync(this.goClipboardPath, ["READ_TEXT"]).then((result) => {
      return base64StringToUTF8(result.stdout);
    });
  }

  readTextSync(): string {
    const buf = execFileSync(this.goClipboardPath, ["READ_TEXT"]);
    return base64BufToUTF8(buf);
  }

  writeText(content: string): Promise<void> {
    return Promise.resolve(this.writeTextSync(content));
  }

  writeTextSync(content: string): void {
    const writeTextProcess = execFile(this.goClipboardPath, ["WRITE_TEXT"]);
    writeTextProcess.stdin?.write(content);
    writeTextProcess.stdin?.end();
  }

  writeImageSync(base64ImgStr: string): void;
  writeImageSync(imgBuf: Buffer): void;
  writeImageSync(data: string | Buffer): void {
    if (data instanceof String || typeof data === "string") {
      const writeImageProcess = execFile(this.goClipboardPath, ["WRITE_IMAGE"]);
      writeImageProcess.stdin?.write(data);
      writeImageProcess.stdin?.end();
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
    const buf = execFileSync(this.goClipboardPath, ["READ_IMAGE"]);
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
        if (subStr.includes("TEXT_CHANGED:")) {
          const text = Buffer.from(strData.substring(13), "base64").toString();
          this.emitter.emit("text", text);
        } else if (subStr.includes("IMAGE_CHANGED:")) {
          const data = strData.substring(14) as string;
          this.emitter.emit("image", Buffer.from(data, "base64"));
          // const imageBase64 = data.toString("base64");
          // console.log(`Image Changed`);
          // fs.writeFileSync("test.png", Buffer.from(data, "base64"));
        }
      });
    });

    this.server.listen(8090, () => {
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

  startListening() {
    const { platform, arch } = process;
    const exePath = this.goClipboardPath;
    if (!fs.existsSync(exePath)) {
      throw new Error(
        `Executable (${this.exeFilename}) not found, your platform is ${platform} ${arch} and may not be supported.`
      );
    }
    this.child = execFile(exePath);
    this.child.stdout?.on("data", (data: Buffer) => {
      const dataStr = data.toString();
      if (dataStr.trim() === "TEXT_CHANGED") {
        this.emitter.emit("text");
      }
      if (dataStr.trim() === "IMAGE_CHANGED") {
        this.emitter.emit("image");
      }
    });

    this.child.stderr?.on("data", (data: Buffer) => {
      this.emitter.emit("open", data.toString());
    });
  }

  close() {
    this.emitter.emit("close");
    this.emitter.removeAllListeners();
    this.server?.close();
    const res = this.child?.kill();
    return res;
  }

  on(event: "text", cb: (text: string) => void): void;
  on(event: "image", cb: (text: string) => void): void;
  on(event: "close", cb: (text: string) => void): void;
  on(event: "text" | "image" | "close", cb: (text: string) => void): void {
    this.emitter.on(event, cb);
  }
}

export default new Clipboard();
