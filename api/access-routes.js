const Router = require("express");
const router = Router();

const { getClientIp } = require("../utils/client-ip.js");
const { isBlocked } = require("../services/gaurd-service.js");
const { createSession } = require("../services/session-service.js");
const { ERROR_RESPONSES, SUCCESS_RESPONSES } = require("../constants/response-codes.js");


router.post("/access", async (req, res) => {
  const ip = getClientIp(req);

  if (isBlocked(ip)) {
    return ERROR_RESPONSES.IP_BLOCKED(res);
  }

  const sessionId = await createSession(ip);
  SUCCESS_RESPONSES.SESSION_CREATED(res, sessionId);
});

module.exports = router;
