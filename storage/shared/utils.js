const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.resolve(process.cwd(), "data");

// file paths
const FILES = {
  sessions: path.join(DATA_DIR, "sessions.json"),
  messages: path.join(DATA_DIR, "messages.json"),
  blocklist: path.join(DATA_DIR, "blocklist.json"),
};

// helper functions
async function ensureDataDir() { 
  await fs.mkdir(DATA_DIR, { recursive: true }); 
}

async function readJson(file, fallback) {
  try { 
    return JSON.parse(await fs.readFile(file, "utf8")); 
  } catch { 
    return fallback; 
  }
}

async function writeJsonAtomic(file, obj) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), "utf8");
  await fs.rename(tmp, file);
}

module.exports = {
  DATA_DIR,
  FILES,
  ensureDataDir,
  readJson,
  writeJsonAtomic
};
