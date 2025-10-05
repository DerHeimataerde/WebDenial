const express = require("express");

const { getClientIp } = require("../utils/client-ip.js");
const { isBlocked, allowAndCount } = require("../services/gaurd-service.js");
const { getSession } = require("../services/session-service.js");
const { storeMessage, latestUnEchoed, latestAny, markEchoed } = require("../services/message-service.js");
const { sha256 } = require("../utils/hash.js");
const { ERROR_RESPONSES, SUCCESS_RESPONSES } = require("../constants/response-codes.js");

function messageRoutes(queueApi) {
  const router = express.Router();

  router.post("/message", async (req, res) => {
    const ip = getClientIp(req);
    const { sessionId, body } = req.body || {};

    if (!sessionId || typeof body === "undefined") {
      return ERROR_RESPONSES.INVALID_PAYLOAD(res);
    }

    const session = getSession(sessionId);
    
    if (!session) return ERROR_RESPONSES.NO_SESSION(res);
    
    if (session.ip !== ip) return ERROR_RESPONSES.IP_MISMATCH(res);
    
    if (isBlocked(ip)) return ERROR_RESPONSES.BLOCKED(res);

    const rate = allowAndCount(ip);
    if (!rate.allow) return ERROR_RESPONSES.RATE_LIMIT(res, rate.reason);

    const record = await storeMessage(sessionId, body);
    
    const q = queueApi.enqueue({ ip, type: "send", onDone: () => {} });

    if (!q.accepted) return ERROR_RESPONSES.QUEUE_FULL(res, q.reason);

    SUCCESS_RESPONSES.MESSAGE_ACCEPTED(res, record.id);
  });

  router.get("/message/echo", async (req, res) => {
    const ip = getClientIp(req);
    const sessionId = req.query.sessionId;

    if (!sessionId) return ERROR_RESPONSES.INVALID_QUERY(res);

    const session = getSession(sessionId);
    
    if (!session) return ERROR_RESPONSES.NO_SESSION(res);
    if (session.ip !== ip) return ERROR_RESPONSES.IP_MISMATCH(res);

    const msg = latestUnEchoed(sessionId);
    if (!msg) return ERROR_RESPONSES.NO_MESSAGE_TO_ECHO(res);

    const ok = sha256(msg.body) === msg.checksum;
    if (!ok) return ERROR_RESPONSES.CHECKSUM_FAIL(res);

    await markEchoed(sessionId, msg.id);
    SUCCESS_RESPONSES.ECHO_RESPONSE(res, msg.id, msg.body);
  });

  router.get("/message/retrieve", (req, res) => {
    const ip = getClientIp(req);
    const sessionId = req.query.sessionId;
    if (!sessionId) return ERROR_RESPONSES.INVALID_QUERY(res);

    const session = getSession(sessionId);
    if (!session) return ERROR_RESPONSES.NO_SESSION(res);
    if (session.ip !== ip) return ERROR_RESPONSES.IP_MISMATCH(res);

    const msg = latestAny(sessionId);
    if (!msg) return ERROR_RESPONSES.NO_MESSAGE_FOUND(res);

    SUCCESS_RESPONSES.MESSAGE_RETRIEVED(res, msg.id, msg.body, msg.echoed);
  });

  return router;
}

module.exports = messageRoutes;
