/**
 * Simple Express-based echo service with IP tracking, sessions,
 * message persistence (JSON file), and basic spam blocking.
 *
 * Use Cases Covered:
 *  - Access (IP Assign)
 *  - Store IP Address
 *  - Send Message
 *  - Check IP for Spam
 *  - Receive Message (Echo)
 *  - Retrieve Message
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ------------------------------------------------------
// Storage
// ------------------------------------------------------
/**
 * We use a JSON file (storage.json) to persist sessions and blocklist.
 * Structure:
 * {
 *   "sessions": {
 *     "IP": {
 *       "sessionId": "...",
 *       "messages": [
 *         { "text": "...", "ts": 1234567890 }
 *       ]
 *     }
 *   },
 *   "blocklist": ["IP1", "IP2"]
 * }
 */
const STORAGE_FILE = path.join(__dirname, "storage.json");

let sessions = {};        // maps IP -> { sessionId, messages: [] }
let blocklist = new Set(); // blocked IPs

// Load existing data from disk
function loadStorage() {
  if (fs.existsSync(STORAGE_FILE)) {
    try {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      const data = JSON.parse(raw);
      sessions = data.sessions || {};
      blocklist = new Set(data.blocklist || []);
      console.log("✅ Storage loaded from storage.json");
    } catch (err) {
      console.error("⚠️ Error reading storage.json:", err);
    }
  }
}

// Save current state back to disk
function saveStorage() {
  const data = {
    sessions,
    blocklist: [...blocklist],
  };
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
}

// ------------------------------------------------------
// Session / IP Management
// ------------------------------------------------------

/**
 * Assign a session to an IP if not already present.
 * Sessions are stored in-memory and persisted to JSON.
 * @param {string} ip - client IP
 * @returns {object} session object
 */
function assignSession(ip) {
  if (!sessions[ip]) {
    sessions[ip] = {
      sessionId: Date.now() + "-" + Math.random(),
      messages: [],
    };
    saveStorage();
    console.log(`🆕 New session assigned to ${ip}: ${sessions[ip].sessionId}`);
  }
  return sessions[ip];
}

// ------------------------------------------------------
// Middleware
// ------------------------------------------------------

/**
 * Middleware to:
 *  - Extract client IP (using x-forwarded-for or socket)
 *  - Check blocklist
 *  - Assign session if new
 */
app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!ip) {
    return res.status(400).json({ error: "Could not determine IP" });
  }

  if (blocklist.has(ip)) {
    return res.status(403).json({ error: "IP blocked" });
  }

  req.clientIp = ip;
  req.session = assignSession(ip);
  next();
});

// ------------------------------------------------------
// Routes
// ------------------------------------------------------

/**
 * POST /message
 * Use Case: Send Message
 * Preconditions: valid session & payload
 * - Validates payload
 * - Performs spam check
 * - Stores message
 */
app.post("/message", (req, res) => {
  const { text } = req.body;

  // Validate payload
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid message payload" });
  }

  // Simple spam rule: if text is "spam", block IP
  if (text.toLowerCase() === "spam") {
    blocklist.add(req.clientIp);
    saveStorage();
    return res.status(403).json({ error: "IP flagged for spam" });
  }

  // Store message
  req.session.messages.push({ text, ts: Date.now() });
  saveStorage();

  res.json({
    status: "ok",
    message: "Message stored",
    ip: req.clientIp,
    session: req.session.sessionId,
  });
});

/**
 * GET /message
 * Use Case: Retrieve Message
 * Preconditions: valid session & stored messages
 * - Returns the most recent message for the client
 */
app.get("/message", (req, res) => {
  const msgs = req.session.messages;
  if (!msgs || msgs.length === 0) {
    return res.status(404).json({ error: "No message available" });
  }
  const latest = msgs[msgs.length - 1];
  res.json({ message: latest.text, ts: latest.ts });
});

/**
 * POST /echo
 * Use Case: Receive Message (Echo)
 * Preconditions: valid payload, not blocked
 * - Stores message
 * - Returns it after 15ms delay
 */
app.post("/echo", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No message provided" });
  }

  if (blocklist.has(req.clientIp)) {
    return res.status(403).json({ error: "Your IP is blocked" });
  }

  // Store message
  req.session.messages.push({ text, ts: Date.now() });
  saveStorage();

  // Echo back after 15ms
  setTimeout(() => {
    res.json({
      message: "Echo after 15ms",
      data: text,
      ip: req.clientIp,
      session: req.session.sessionId,
    });
  }, 15);
});

// ------------------------------------------------------
// Startup
// ------------------------------------------------------

loadStorage();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
