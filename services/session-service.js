const { saveSession, getSession: getSessionFS } = require("../storage/index.js");
const { uid } = require("../utils/hash.js");

function getSession(sessionId) {
  return getSessionFS(sessionId);
}
async function createSession(ip) {
  const sessionId = uid();
  await saveSession(sessionId, { ip, createdAt: Date.now() });
  return sessionId;
}

module.exports = { getSession, createSession };
