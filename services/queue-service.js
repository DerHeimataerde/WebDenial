const { CONFIG } = require("../config.js");

function createQueue() {
  const queue = [];
  let active = 0;

  function enqueue(item) {
    if (queue.some(q => q.ip === item.ip)) {
      return { accepted: false, reason: "ONE_IN_QUEUE_PER_IP" };
    }
    queue.push(item);
    processQueue();
    return { accepted: true };
  }

  function processQueue() {
    while (active < CONFIG.MAX_CONCURRENCY && queue.length) {
      const item = queue.shift();
      active++;
      setTimeout(() => {
        try {
            if (item.onDone) item.onDone();
        } finally {
            active--;
            processQueue();
        }
      }, CONFIG.PROCESSING_DELAY_MS);
    }
  }

  return { enqueue, queueRef: queue };
}

module.exports = { createQueue };
