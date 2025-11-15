const { isBlocked: isBlockedFS, blocklistAdd } = require("../storage/index.js");
const { CONFIG } = require("../config.js");

const rateCounters = new Map();
/* *** MS-4 addition *** */
const echoRateCounters = new Map();
const sessionRateCounters = new Map();

// violation tracking for automatic ip blocking
const violations = new Map();
const temporaryBlocks = new Map();

// check if ip is temporarily blocked
function isTemporarilyBlocked(ip) {
  const block = temporaryBlocks.get(ip);
  if (!block) return false;
  const now = Date.now();
  if (now >= block.blockedUntil) {
    // block expired
    temporaryBlocks.delete(ip);
    return false;
  }
  return true;
}

// track violations and auto-block if threshold is exceeded
async function recordViolation(ip) {
  const now = Date.now();
  const window = CONFIG.VIOLATION_WINDOW_MS;
  
  let violationList = violations.get(ip) || [];
  
  violationList = violationList.filter(v => now - v < window);
  
  // add current violation
  violationList.push(now);
  violations.set(ip, violationList);
  
  if (violationList.length >= CONFIG.MAX_VIOLATIONS_BEFORE_BLOCK) {
    // auto block this ip
    const blockedUntil = now + CONFIG.BLOCK_DURATION_MS;
    temporaryBlocks.set(ip, { blockedUntil });
    
    // add to persistent blocklist
    try {
      await blocklistAdd(ip);
    } catch (err) {
      console.error(`Failed to persist blocklist for IP ${ip}:`, err);
    }
    
    console.log(`Auto-blocked IP ${ip} for ${CONFIG.BLOCK_DURATION_MS / 1000} seconds due to ${violationList.length} violations`);
    return true;
  }
  
  return false;
}

function rateLimitCheck(ip, counters, maxRequests, windowMs) {
  const now = Date.now();
  let arr = counters.get(ip) || [];
  arr = arr.filter(ts => now - ts < windowMs);
  
  if (arr.length >= maxRequests) {
    counters.set(ip, arr);
    return { allow: false, reason: "RATE_LIMIT" };
  }
  arr.push(now);
  counters.set(ip, arr);
  return { allow: true };
}
/* *** End MS-4 Addition *** */

function isBlocked(ip) {
  /* *** MS-4 addition *** */
  // check both persistent and temporary blocks
  if (isTemporarilyBlocked(ip)) {
    return true;
  }
  /* *** End MS-4 Addition *** */
  return isBlockedFS(ip);
}

function allowAndCount(ip) {
  const now = Date.now();
  const RATE_LIMIT_WINDOW_MS = CONFIG.RATE_LIMIT_WINDOW_MS;

  let arr = rateCounters.get(ip) || [];
  arr = arr.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (arr.length >= CONFIG.RATE_LIMIT_MAX) {
    rateCounters.set(ip, arr);
    /* *** MS-4 addition *** */
    recordViolation(ip).catch(err => console.error(`Error recording violation for ${ip}:`, err));
    /* *** End MS-4 Addition *** */
    return { allow: false, reason: "RATE_LIMIT" };
  }
  arr.push(now);
  rateCounters.set(ip, arr);
  return { allow: true };
}

/* *** MS-4 addition *** */
// raet limiting for echo endpoint
function allowAndCountEcho(ip) {
  const result = rateLimitCheck(
    ip,
    echoRateCounters,
    CONFIG.ECHO_RATE_LIMIT_MAX,
    CONFIG.ECHO_RATE_LIMIT_WINDOW_MS
  );
  
  if (!result.allow) {
    recordViolation(ip).catch(err => console.error(`Error recording violation for ${ip}:`, err));
  }
  
  return result;
}

function allowAndCountSession(ip) {
  const result = rateLimitCheck(
    ip,
    sessionRateCounters,
    CONFIG.SESSION_RATE_LIMIT_MAX,
    CONFIG.SESSION_RATE_LIMIT_WINDOW_MS
  );
  
  if (!result.allow) {
    recordViolation(ip).catch(err => console.error(`Error recording violation for ${ip}:`, err));
  }
  
  return result;
}
/* *** End MS-4 Addition *** */

module.exports = { 
  isBlocked, 
  allowAndCount,
  /* *** MS-4 addition *** */
  allowAndCountEcho,
  allowAndCountSession,
  recordViolation,
  isTemporarilyBlocked
  /* *** End MS-4 Addition *** */
};
