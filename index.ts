import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "events";
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";

class ClipboardEventListener extends EventEmitter {
  child: ChildProcessWithoutNullStreams | undefined;
  constructor() {
    super();
    this.child = undefined;
  }

  startListening() {
    const { platform, arch } = process;
    const pathArr = [__dirname];

    if (path.basename(__dirname) === "dist") {
      pathArr.push("..");
    }
    const exeFilename = `go-clipboard-monitor-${platform}-${arch}s`;
    pathArr.push(...["go-clipboard-monitor", exeFilename]);
    const exePath = path.join(...pathArr);
    if (!fs.existsSync(exePath)) {
      throw new Error(
        `Executable (${exeFilename}) not found, your platform is ${platform} ${arch} and may not be supported.`
      );
    }
    this.child = spawn(exePath);
    this.child.stdout?.on("data", (data: Buffer) => {
      const dataStr = data.toString();
      if (dataStr.trim() === "TEXT_CHANGED") {
        this.emit("text");
      }
      if (dataStr.trim() === "IMAGE_CHANGED") {
        this.emit("image");
      }
    });

    this.child.stderr?.on("data", (data: Buffer) => {
      this.emit("open", data.toString());
    });
  }

  stopListening() {
    this.emit("close");
    const res = this.child?.kill();
    return res;
  }
}

export default new ClipboardEventListener();
