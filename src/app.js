const http = require("http");
const chalk = require("chalk");
const path = require("path");
const conf = require("./config/defaultConfig");
const route = require("./helper/route");
const openUrl = require("./helper/openUrl");
class Server {
  constructor(config) {
    this.conf = Object.assign({}, conf, config);
  }

  start() {
    const server = http.createServer((req, res) => {
      const url = req.url;
      const filePath = path.join(this.conf.root, url);
      route(req, res, filePath, this.conf);
    });

    server.listen(this.conf.port, conf.hostname, () => {
      const addr = `http://${this.conf.hostname}:${this.conf.port}`;
      console.info(`Server started at ${chalk.green(addr)}`);
      openUrl(addr);
    });
  }
}
module.exports = Server;

// const server = http.createServer((req, res) => {
//     const url = req.url;
//     const filePath = path.join(conf.root, url);
//     fs.stat(filePath, (err, stats) => {
//         if (err) {
//             res.statusCode = 404;
//             res.setHeader("Content-Type", "text/plain");
//             res.end(`${filePath} is not a directory or file`);
//             return;
//         }

//         if (stats.isFile()) {
//             res.statusCode = 200;
//             res.setHeader("Content-Type", "text/plain");
//             // fs.readFile(filePath,(err,data)=>{
//             //     res.end(data);
//             // })  //全部读完才返回给客户端 相应较慢
//             fs.createReadStream(filePath).pipe(res);
//         } else if (stats.isDirectory()) {
//             fs.readdir(filePath, (err, files) => {
//                 res.statusCode = 200;
//                 res.setHeader("Content-Type", "text/plain");
//                 res.end(files.join(","));
//             });
//         }
//     });
//     // res.statusCode = 200;
//     // res.setHeader("Content-Type", "text/html");
//     // res.write("<html>");
//     // res.write("<body>");
//     // res.write("Hello HTTP!");
//     // res.write("</body>");
//     // res.end("</html>");
//     // res.end(filePath);
// });
