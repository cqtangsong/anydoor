const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const promisify = require("util").promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
// const iconv = require("iconv-lite");

const htmlPath = path.join(__dirname, "../template/drr.html");
const source = fs.readFileSync(htmlPath); //读出来的是buffer
const template = Handlebars.compile(source.toString());
// const config = require("../config/defaultConfig");
const mime = require("./mime");
const compress = require("./compress");
const range = require("./range");
const isFresh = require("./cache");

module.exports = async function(req, res, filePath, config) {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const contentType = mime(filePath);
      res.statusCode = 200;
      res.setHeader("Content-Type", contentType);
      // res.setHeader("Content-Type", "text/plain");
      // fs.readFile(filePath,(err,data)=>{
      //     res.end(data);
      // })  //全部读完才返回给客户端 相应较慢

      if (isFresh(stats, req, res)) {
        res.statusCode = 304;
        res.end();
        return;
      }

      let rs;
      const { code, start, end } = range(stats.size, req, res);
      if (code === 200) {
        rs = fs.createReadStream(filePath);
      } else {
        rs = fs.createReadStream(filePath, {
          start,
          end,
          encoding: "utf-8",
          bufferSize: 11
        });
      }
      // let rs = fs.createReadStream(filePath);
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res);
      }
      //   rs.setEncoding("UTF-8");

      //   var size = 0;
      //   var chunks = [];
      //   rs.on("data", function(chunk) {
      //     chunks.push(chunk); //将每次读取的buffer对象放入数组
      //     size += chunk.length; //统计所有元素的个数

      //   });
      //   rs.on("end", function() {
      //     var buf = Buffer.concat(chunks, size); //合并成一个大buffer对象
      //     console.log(iconv.decode(buf, "utf-8")); //用iconv转换
      //   }); //春眠不觉晓，处处闻啼鸟;夜来风雨声，花落知多少。
      rs.pipe(res);
      // fs.createReadStream(filePath).pipe(res);
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath);
      const dir = path.relative(config.root, filePath);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      const data = {
        title: path.basename(filePath),
        dir: dir ? `/${dir}` : "",
        files
      };
      res.end(template(data));
    }
  } catch (ex) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end(`${filePath} is not a directory or file`);
  }
};
