import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'events';
import { spawn, execFile, ChildProcessWithoutNullStreams, ChildProcess } from 'node:child_process';

class ClipboardEventListener extends EventEmitter {
  child: ChildProcess | undefined;
  constructor() {
    super();
    this.child = undefined;
  }

  startListening() {
    const { platform, arch } = process;
    const pathArr = [__dirname];

    if (path.basename(__dirname) === 'dist') {
      pathArr.push('..');
    }
    let exeFilename = `go-clipboard-${platform}-${arch}`;
    if (platform === 'win32') {
      exeFilename += '.exe';
    }
    pathArr.push(...['go-clipboard', exeFilename]);
    const exePath = path.join(...pathArr);
    if (!fs.existsSync(exePath)) {
      throw new Error(
        `Executable (${exeFilename}) not found, your platform is ${platform} ${arch} and may not be supported.`
      );
    }
    this.child = execFile(exePath);
    this.child.stdout?.on('data', (data: Buffer) => {
      const dataStr = data.toString();
      if (dataStr.trim() === 'TEXT_CHANGED') {
        this.emit('text');
      }
      if (dataStr.trim() === 'IMAGE_CHANGED') {
        this.emit('image');
      }
    });

    this.child.stderr?.on('data', (data: Buffer) => {
      this.emit('open', data.toString());
    });
  }

  stopListening() {
    this.emit('close');
    const res = this.child?.kill();
    return res;
  }
}

export default new ClipboardEventListener();
