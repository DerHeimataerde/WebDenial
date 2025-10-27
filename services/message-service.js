const {
    saveMessage: saveMsgFS,
    latestUnEchoed: latestUnEchoedFS,
    latestAny: latestAnyFS,
    setEchoed: setEchoedFS
  } = require("../storage/index.js");
  const { uid, sha256 } = require("../utils/hash.js");
  
  async function storeMessage(sessionId, body) {
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);
    const record = {
      id: uid(),
      body: bodyString,
      checksum: sha256(bodyString),
      echoed: false,
      createdAt: Date.now()
    };
    await saveMsgFS(sessionId, record);
    return record;
  }
  
  function latestUnEchoed(sessionId) {return latestUnEchoedFS(sessionId); }
  
  function latestAny(sessionId) { return latestAnyFS(sessionId); }
  
  async function markEchoed(sessionId, messageId) { await setEchoedFS(sessionId, messageId); }
  
  module.exports = { storeMessage, latestUnEchoed, latestAny, markEchoed };
  