const { isBlocked: isBlockedFS } = require("../storage/index.js");
const { CONFIG } = require("../config.js");

const rateCounters = new Map();

function isBlocked(ip) { return isBlockedFS(ip); }

function allowAndCount(ip) {
  const now = Date.now();
  const RATE_LIMIT_WINDOW_MS = CONFIG.RATE_LIMIT_WINDOW_MS;

  let arr = rateCounters.get(ip) || [];
  arr = arr.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (arr.length >= CONFIG.RATE_LIMIT_MAX) {
    rateCounters.set(ip, arr);
    return { allow: false, reason: "RATE_LIMIT" };
  }
  arr.push(now);
  rateCounters.set(ip, arr);
  return { allow: true };
}

module.exports = { isBlocked, allowAndCount };
