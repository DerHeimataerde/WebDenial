const CONFIG = {
    PORT: parseInt(process.env.PORT || "3000", 10),
    RATE_LIMIT_MAX: 5,
    RATE_LIMIT_WINDOW_MS: 2000, // 2 seconds
    PROCESSING_DELAY_MS: 15,
    MAX_CONCURRENCY: 1,
  };

module.exports = { CONFIG };
  