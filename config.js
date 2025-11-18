const CONFIG = {
	PORT: parseInt(process.env.PORT || "3000", 10),
	RATE_LIMIT_MAX: 5,
	RATE_LIMIT_WINDOW_MS: 2000, // 2 seconds
	PROCESSING_DELAY_MS: 15,
	MAX_CONCURRENCY: 1,

	/* *** MS-4 addition *** */
	ECHO_RATE_LIMIT_MAX: 10, // higher limit for echo endpoint
	ECHO_RATE_LIMIT_WINDOW_MS: 2000, // 2 seconds window for echo
	SESSION_RATE_LIMIT_MAX: 3, // stricter limit for session creation
	SESSION_RATE_LIMIT_WINDOW_MS: 60000, // 1 minute window for sessions
	MAX_VIOLATIONS_BEFORE_BLOCK: 5, // auto block after 5 violations
	VIOLATION_WINDOW_MS: 60000, // 1 minute window for violation tracking
	BLOCK_DURATION_MS: 300000, // 5 minutes block duration
	MAX_REQUEST_SIZE: "100kb",
	TRUST_PROXY: false, // do not trust by default
	DEMO_MODE: false, // when true, allows X-Forwarded-For on localhost for testing
	/* *** End MS-4 Addition *** */
};

module.exports = { CONFIG };
