const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const promisify = require("util").promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const htmlPath = path.join(__dirname, "../template/drr.html");
const source = fs.readFileSync(htmlPath); //读出来的是buffer
const template = Handlebars.compile(source.toString());
const config = require("../config/defaultConfig");
const mime = require("./mime");
const compress = require("./compress");
const range = require("./range");

module.exports = async function(req, res, filePath) {
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
            let rs;
            const { code, start, end } = range(stats.size, req, res);
            if (code === 200) {
                rs = fs.createReadStream(filePath);
            } else {
                rs = rs = fs.createReadStream(filePath, { start, end });
            }
            // let rs = fs.createReadStream(filePath);
            if (filePath.match(config.compress)) {
                rs = compress(rs, req, res);
            }
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
