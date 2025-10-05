const { FILES, readJson, writeJsonAtomic } = require("../shared/utils");

// in-memory messages
// [ { id, body, checksum, echoed, createdAt } ]
const _messagesBySession = new Map();

async function persistMessages() {
  const flat = {};
  for (const [sid, arr] of _messagesBySession.entries()) {
    flat[sid] = arr;
  }
  await writeJsonAtomic(FILES.messages, flat);
}

function getMessages(sessionId) { 
  return _messagesBySession.get(sessionId) || []; 
}

async function saveMessage(sessionId, record) {
  const list = _messagesBySession.get(sessionId) || [];
  list.push(record);
  _messagesBySession.set(sessionId, list);
  await persistMessages();
}

function latestUnEchoed(sessionId) {
  const list = _messagesBySession.get(sessionId) || [];
  for (let i = list.length - 1; i >= 0; i--) {
    if (!list[i].echoed) return list[i];
  }
  return null;
}

function latestAny(sessionId) {
  const list = _messagesBySession.get(sessionId) || [];
  return list[list.length - 1] || null;
}

async function setEchoed(sessionId, messageId) {
  const list = _messagesBySession.get(sessionId) || [];
  const it = list.find((msg) => msg.id === messageId);
  if (it) { 
    it.echoed = true; 
    await persistMessages(); 
  }
}

async function initMessages() {
  const msgObj = await readJson(FILES.messages, {});
  for (const [sid, arr] of Object.entries(msgObj)) {
    _messagesBySession.set(sid, arr);
  }
}

module.exports = {
  getMessages,
  saveMessage,
  latestUnEchoed,
  latestAny,
  setEchoed,
  initMessages,
  persistMessages
};
