const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: true, code: "INTERNAL", message: "Internal server error" });
};

module.exports = { errorHandler };