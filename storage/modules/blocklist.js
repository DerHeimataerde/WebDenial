const { FILES, readJson, writeJsonAtomic } = require("../shared/utils");

// in-memory blocklist
const _blocklist = new Set();

async function persistBlocklist() {
  await writeJsonAtomic(FILES.blocklist, Array.from(_blocklist));
}

function isBlocked(ip) { 
  return _blocklist.has(ip); 
}

async function blocklistAdd(ip) { 
  _blocklist.add(ip); 
  await persistBlocklist(); 
}

async function blocklistRemove(ip) { 
  _blocklist.delete(ip); 
  await persistBlocklist(); 
}

async function initBlocklist() {
  const blArr = await readJson(FILES.blocklist, []);
  for (const ip of blArr) {
    _blocklist.add(ip);
  }
}

module.exports = {
  isBlocked,
  blocklistAdd,
  blocklistRemove,
  initBlocklist,
  persistBlocklist
};
