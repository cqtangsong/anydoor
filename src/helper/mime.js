const path = require("path");
const mimeTypes = {
    css: "text/css",
    gif: "image/gif",
    html: "text/html",
    ico: "image/x-icon",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "text/javescript",
    json: "application/json",
    pdf: "application/pdf",
    png: "image/png",
    svg: "image/svg+xml",
    swf: "application/x-shockwave-flash",
    txt: "text/plain",
    wav: "audio/x-wav",
    xml: "text/xml"
};

module.exports = filePath => {
    let ext = path
        .extname(filePath)
        .split(".")
        .pop()
        .toLowerCase(); //jquery.min.js
    if (!ext) {
        ext = filePath;
    }
    return mimeTypes[ext] || mimeTypes["txt"];
};
