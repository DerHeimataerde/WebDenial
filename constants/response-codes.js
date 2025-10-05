// HTTP Status Codes
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// Error Codes
const ERROR_CODES = {
  // request validation errors
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  INVALID_QUERY: "INVALID_QUERY",
  
  // authentication & authorization errors
  NO_SESSION: "NO_SESSION",
  IP_MISMATCH: "IP_MISMATCH",
  BLOCKED: "BLOCKED",
  
  // rate limiting errors
  RATE_LIMIT: "RATE_LIMIT",
  
  // data errors
  NO_MESSAGE: "NO_MESSAGE",
  CHECKSUM_FAIL: "CHECKSUM_FAIL",
  
  // system errors
  INTERNAL: "INTERNAL"
};

// Error Messages
const ERROR_MESSAGES = {
  // request validation messages
  INVALID_PAYLOAD: "sessionId and body required",
  INVALID_QUERY: "sessionId required",
  
  // authentication & authorization messages
  NO_SESSION: "Invalid session",
  IP_MISMATCH: "IP mismatch",
  BLOCKED: "IP blocked",
  IP_BLOCKED: "IP Blocked",
  
  // rate limiting messages
  TOO_MANY_REQUESTS: "Too many requests",
  TRY_AGAIN_LATER: "Try again later",
  
  // data messages
  NO_MESSAGE_TO_ECHO: "No message to echo",
  NO_MESSAGE_FOUND: "No message found",
  INTEGRITY_CHECK_FAILED: "Integrity check failed",
  
  // system messages
  INTERNAL_SERVER_ERROR: "Internal server error"
};

// Success Messages
const SUCCESS_MESSAGES = {
  ECHO_RESPONSE: "Echo after 15ms",
  MESSAGE_ACCEPTED: "accepted"
};

// success status codes
const SUCCESS_STATUS = {
  ACCEPTED: "accepted"
};

// response templates
const RESPONSE_TEMPLATES = {
  ERROR: (code, message) => ({
    error: true,
    code,
    message
  }),
  
  SUCCESS: (data = {}) => ({
    error: false,
    ...data
  }),
  
  SESSION_CREATED: (sessionId) => ({
    sessionId
  }),
  
  MESSAGE_ACCEPTED: (messageId) => ({
    messageId,
    status: SUCCESS_STATUS.ACCEPTED
  }),
  
  ECHO_RESPONSE: (messageId, body) => ({
    messageId,
    body
  }),
  
  MESSAGE_RETRIEVED: (messageId, body, echoed) => ({
    messageId,
    body,
    echoed
  }),
  
  BASIC_ECHO: (data) => ({
    message: SUCCESS_MESSAGES.ECHO_RESPONSE,
    data
  })
};

// Error Response Helpers
const ERROR_RESPONSES = {
  INVALID_PAYLOAD: (res) => 
    res.status(HTTP_STATUS.BAD_REQUEST).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.INVALID_PAYLOAD, ERROR_MESSAGES.INVALID_PAYLOAD)
    ),
    
  INVALID_QUERY: (res) => 
    res.status(HTTP_STATUS.BAD_REQUEST).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.INVALID_QUERY, ERROR_MESSAGES.INVALID_QUERY)
    ),
    
  NO_SESSION: (res) => 
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.NO_SESSION, ERROR_MESSAGES.NO_SESSION)
    ),
    
  IP_MISMATCH: (res) => 
    res.status(HTTP_STATUS.FORBIDDEN).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.IP_MISMATCH, ERROR_MESSAGES.IP_MISMATCH)
    ),
    
  BLOCKED: (res) => 
    res.status(HTTP_STATUS.FORBIDDEN).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.BLOCKED, ERROR_MESSAGES.BLOCKED)
    ),
    
  IP_BLOCKED: (res) => 
    res.status(HTTP_STATUS.FORBIDDEN).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.BLOCKED, ERROR_MESSAGES.IP_BLOCKED)
    ),
    
  RATE_LIMIT: (res, reason) => 
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      RESPONSE_TEMPLATES.ERROR(reason, ERROR_MESSAGES.TOO_MANY_REQUESTS)
    ),
    
  QUEUE_FULL: (res, reason) => 
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      RESPONSE_TEMPLATES.ERROR(reason, ERROR_MESSAGES.TRY_AGAIN_LATER)
    ),
    
  NO_MESSAGE_TO_ECHO: (res) => 
    res.status(HTTP_STATUS.NOT_FOUND).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.NO_MESSAGE, ERROR_MESSAGES.NO_MESSAGE_TO_ECHO)
    ),
    
  NO_MESSAGE_FOUND: (res) => 
    res.status(HTTP_STATUS.NOT_FOUND).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.NO_MESSAGE, ERROR_MESSAGES.NO_MESSAGE_FOUND)
    ),
    
  CHECKSUM_FAIL: (res) => 
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.CHECKSUM_FAIL, ERROR_MESSAGES.INTEGRITY_CHECK_FAILED)
    ),
    
  INTERNAL_ERROR: (res) => 
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      RESPONSE_TEMPLATES.ERROR(ERROR_CODES.INTERNAL, ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    )
};

// Success Response Helpers
const SUCCESS_RESPONSES = {
  SESSION_CREATED: (res, sessionId) => 
    res.json(RESPONSE_TEMPLATES.SESSION_CREATED(sessionId)),
    
  MESSAGE_ACCEPTED: (res, messageId) => 
    res.json(RESPONSE_TEMPLATES.MESSAGE_ACCEPTED(messageId)),
    
  ECHO_RESPONSE: (res, messageId, body) => 
    res.json(RESPONSE_TEMPLATES.ECHO_RESPONSE(messageId, body)),
    
  MESSAGE_RETRIEVED: (res, messageId, body, echoed) => 
    res.json(RESPONSE_TEMPLATES.MESSAGE_RETRIEVED(messageId, body, echoed)),
    
  BASIC_ECHO: (res, data) => 
    res.json(RESPONSE_TEMPLATES.BASIC_ECHO(data))
};

module.exports = {
  HTTP_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SUCCESS_STATUS,
  RESPONSE_TEMPLATES,
  ERROR_RESPONSES,
  SUCCESS_RESPONSES
};
