/* *** MS-4 addition *** */
const { HTTP_STATUS, ERROR_CODES } = require("../constants/response-codes");
/* *** End MS-4 Addition *** */

const errorHandler = (err, _req, res, _next) => {
  /* *** MS-4 addition *** */
  if (err.type === "entity.too.large" || err.name === "PayloadTooLargeError") {
    return res.status(413).json({ 
      error: true, 
      code: "PAYLOAD_TOO_LARGE", 
      message: "Request entity too large" 
    });
  }
  /* *** End MS-4 Addition *** */
  
  console.error(err);
  res.status(500).json({ error: true, code: "INTERNAL", message: "Internal server error" });
};

module.exports = { errorHandler };