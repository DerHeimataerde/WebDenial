const { ensureDataDir } = require("./shared/utils");
const sessions = require("./modules/sessions");
const messages = require("./modules/messages");
const blocklist = require("./modules/blocklist");

async function initFileStore() {
  await ensureDataDir();
  await sessions.initSessions();
  await messages.initMessages();
  await blocklist.initBlocklist();
}

module.exports = {
  // init
  initFileStore,
  
  // essions
  getSession: sessions.getSession,
  saveSession: sessions.saveSession,
  
  // messages
  getMessages: messages.getMessages,
  saveMessage: messages.saveMessage,
  latestUnEchoed: messages.latestUnEchoed,
  latestAny: messages.latestAny,
  setEchoed: messages.setEchoed,
  
  // blocklist
  isBlocked: blocklist.isBlocked,
  blocklistAdd: blocklist.blocklistAdd,
  blocklistRemove: blocklist.blocklistRemove
};
