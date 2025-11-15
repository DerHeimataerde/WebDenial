/* *** MS-4 addition *** */
// Get real IP address (prioritize actual connection IP over X-Forwarded-For to mitigate spoofing)
function getRealIp(req) {  
  const realIp = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "0.0.0.0";
  return realIp.replace(/^::ffff:/, "");
}

function getXForwardedFor(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) {
    // X-Forwarded-For can contain multiple IPs; take the first one
    return xf.split(",")[0].trim();
  }
  return null;
}
/* *** End MS-4 Addition *** */

function getClientIp(req) {
  /* *** MS-4 addition *** */
  // prefer real IP over X-Forwarded-For to prevent IP spoofing
  const realIp = getRealIp(req);
  // use X-Forwarded-For if real ip is unavailable or invalid
  if (realIp === "0.0.0.0" || realIp === "::1" || realIp === "127.0.0.1") {
    const xff = getXForwardedFor(req);
    if (xff) return xff;
  }
  return realIp;
  /* *** End MS-4 Addition *** */
}

/* *** MS-4 addition *** */
function getClientIpInfo(req) {
  return {
    realIp: getRealIp(req),
    xForwardedFor: getXForwardedFor(req),
    primary: getClientIp(req)
  };
}
/* *** End MS-4 Addition *** */

module.exports = { getClientIp, getClientIpInfo, getRealIp, getXForwardedFor };
    