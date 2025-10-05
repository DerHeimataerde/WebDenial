const { FILES, readJson, writeJsonAtomic } = require("../shared/utils");

// in-memory session
// { ip, createdAt }
const _sessions = new Map();

async function persistSessions() {
  const flat = Object.fromEntries(_sessions.entries());
  await writeJsonAtomic(FILES.sessions, flat);
}

function getSession(sessionId) { 
  return _sessions.get(sessionId); 
}

async function saveSession(sessionId, rec) { 
  _sessions.set(sessionId, rec); 
  await persistSessions(); 
}

async function initSessions() {
  const sessionsObj = await readJson(FILES.sessions, {});
  for (const [key, value] of Object.entries(sessionsObj)) {
    _sessions.set(key, value);
  }
}

module.exports = {
  getSession,
  saveSession,
  initSessions,
  persistSessions
};
