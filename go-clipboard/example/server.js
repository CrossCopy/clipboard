const net = require("net");
const fs = require("fs");
const path = require("path");
const { execFile } = require("node:child_process");

const server = net.createServer(function (con) {
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
      console.log(
        `Text Changed: ${Buffer.from(
          strData.substring(13),
          "base64"
        ).toString()}`
      );
    } else if (subStr.includes("IMAGE_CHANGED:")) {
      const imageBase64 = strData.substring(14).toString("base64");
      console.log(`Image Changed`);
      fs.writeFileSync('test.png', Buffer.from(imageBase64, "base64"));
    }
  });
});

server.listen(19559, function () {
  console.log("server is listening");
  const execPath = path.join(__dirname, "client");
  const child = execFile(execPath, [server.address().port]);
  child.stdout.on("data", (data) => {
    console.log("Received data from client socket stdout:\n" + data);
  });
});
