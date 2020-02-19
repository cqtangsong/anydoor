const { createGzip, createDeflate } = require("zlib");
module.exports = (rs, req, res) => {
    const acceptEncoding = req.headers["accept-encoding"];
    if (!acceptEncoding || !acceptEncoding.match(/\b(gizp|deflate)\b/)) {
        return rs;
    } else if (acceptEncoding.match(/\bgizp\b/)) {
        res.setHeader("Content-Encoding", "gzip");
        return rs.pipe(createGzip());
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
        res.setHeader("Content-Encoding", "deflate");
        return rs.pipe(createDeflate());
    }
};
