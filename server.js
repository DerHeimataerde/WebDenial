const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/echo", (req, res) => {
  setTimeout(() => {
    res.json({
      message: "Echo after 15ms",
      data: req.body
    });
  }, 15);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
