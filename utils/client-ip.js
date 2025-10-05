function getClientIp(req) {
    const xf = req.headers["x-forwarded-for"];
    if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
    return req.ip || req.socket?.remoteAddress || "0.0.0.0";
  }

module.exports = { getClientIp };
    