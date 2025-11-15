const express = require("express");
const app = express();
const { CONFIG } = require("./config");
const { errorHandler } = require("./middleware/error-handler");
const { initFileStore } = require("./storage/index");
const accessRoutes = require("./api/access-routes");
const messageRoutes = require("./api/message-routes");
const { createQueue } = require("./services/queue-service");
/* *** MS-4 addition *** */
const { getClientIp } = require("./utils/client-ip");
const { isBlocked, allowAndCountEcho } = require("./services/gaurd-service");
const { ERROR_RESPONSES, SUCCESS_RESPONSES } = require("./constants/response-codes");
/* *** End MS-4 Addition *** */

const { enqueue, queueRef } = createQueue();

/* *** MS-4 addition *** */
// add request size limits to prevent DoS via large payloads
app.use(express.json({ limit: CONFIG.MAX_REQUEST_SIZE }));
/* *** End MS-4 Addition *** */

/* *** MS-4 addition *** */
// protect /echo endpoint with rate limiting, blocklist check, and queue protection
app.post("/echo", async (req, res) => {
  const ip = getClientIp(req);
  
  // check if ip is blocked
  if (isBlocked(ip)) {
    return ERROR_RESPONSES.IP_BLOCKED(res);
  }
  
  // apply rate limiting for echo endpoint
  const rate = allowAndCountEcho(ip);
  if (!rate.allow) {
    return ERROR_RESPONSES.RATE_LIMIT(res, rate.reason);
  }
  
  // use queue to limit concurrent processing
  const q = enqueue({ 
    ip, 
    type: "echo", 
    onDone: () => {
      // process echo request
      res.json({
        message: "Echo after 15ms",
        data: req.body
      });
    }
  });
  
  if (!q.accepted) {
    return ERROR_RESPONSES.QUEUE_FULL(res, q.reason);
  }
});
/* *** End MS-4 Addition *** */

app.use("/api", accessRoutes);
app.use("/api", messageRoutes({ enqueue }));
app.use(errorHandler);

/* -------- Start Server -------- */
(async function main() {
  await initFileStore();
  app.listen(CONFIG.PORT, () => {
    console.log(`Server running on http://localhost:${CONFIG.PORT}`);
  });
})();
/* ------------------------------ */

