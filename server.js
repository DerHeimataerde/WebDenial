const express = require("express");
const app = express();
const { CONFIG } = require("./config");
const { errorHandler } = require("./middleware/error-handler");
const { initFileStore } = require("./storage/index");
const accessRoutes = require("./api/access-routes");
const messageRoutes = require("./api/message-routes");
const { createQueue } = require("./services/queue-service");

const { enqueue, queueRef } = createQueue();

app.use(express.json());

app.post("/echo", (req, res) => {
  setTimeout(() => {
    res.json({
      message: "Echo after 15ms",
      data: req.body
    });
  }, 15);
});

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

