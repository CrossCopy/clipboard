var net = require("net");
const fs = require("fs");

var server = net.createServer(function (connection) {
  console.log("client connected");

  connection.on("end", function () {
    console.log("client disconnected");
  });

  connection.on("data", (data) => {
    const strData = data.toString();
    const subStr = strData.substring(0, 14);
    if (subStr.includes("TEXT_CHANGED:")) {
      console.log(`Text Changed: ${Buffer.from(strData.substring(13), 'base64').toString()}`);
    } else if (subStr.includes("IMAGE_CHANGED:")) {
      const imageBase64 = strData.substring(14).toString("base64");
      console.log(`Image Changed: ${imageBase64}`);
      fs.writeFileSync("test2.jpg", Buffer.from(imageBase64, "base64"));
    }
  });
});

server.listen(8090, function () {
  console.log("server is listening");
});
