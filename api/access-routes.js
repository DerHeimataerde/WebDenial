const Router = require("express");
const router = Router();

const { getClientIp } = require("../utils/client-ip.js");
const { isBlocked, allowAndCountSession } = require("../services/gaurd-service.js");
const { createSession } = require("../services/session-service.js");
const { ERROR_RESPONSES, SUCCESS_RESPONSES } = require("../constants/response-codes.js");


router.post("/access", async (req, res) => {
  const ip = getClientIp(req);

  /* *** MS-4 addition *** */
  // check if ip is blocked
  if (isBlocked(ip)) {
    return ERROR_RESPONSES.IP_BLOCKED(res);
  }

  // apply rate limiting for session creation
  const rate = allowAndCountSession(ip);
  if (!rate.allow) {
    return ERROR_RESPONSES.RATE_LIMIT(res, rate.reason);
  }
  /* *** End MS-4 Addition *** */

  const sessionId = await createSession(ip);
  SUCCESS_RESPONSES.SESSION_CREATED(res, sessionId);
});

module.exports = router;
