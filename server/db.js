import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const storeFile = path.join(dataDir, 'store.json');

const emptyStore = () => ({
  wishes: [],
  future_messages: [],
  open_when_opens: [],
  nextId: { wishes: 1, future_messages: 1, open_when_opens: 1 },
});

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function readStore() {
  if (!fs.existsSync(storeFile)) return emptyStore();
  try {
    return { ...emptyStore(), ...JSON.parse(fs.readFileSync(storeFile, 'utf8')) };
  } catch {
    return emptyStore();
  }
}

function writeStore(store) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2));
}

function nextId(store, table) {
  const id = store.nextId[table];
  store.nextId[table] = id + 1;
  return id;
}

export function insertWish(wish) {
  const store = readStore();
  const row = { id: nextId(store, 'wishes'), wish, created_at: now() };
  store.wishes.push(row);
  writeStore(store);
  return row;
}

export function listWishes() {
  return readStore().wishes.slice().sort((a, b) => b.id - a.id);
}

export function hasWish() {
  return readStore().wishes.length > 0;
}

export function clearWishes() {
  const store = readStore();
  store.wishes = [];
  store.nextId.wishes = 1;
  writeStore(store);
}

export function insertFutureMessage(message, unlockAt) {
  const store = readStore();
  const row = {
    id: nextId(store, 'future_messages'),
    message,
    unlock_at: unlockAt,
    created_at: now(),
  };
  store.future_messages.push(row);
  writeStore(store);
  return row;
}

export function listFutureMessages() {
  return readStore().future_messages.slice().sort((a, b) => b.id - a.id);
}

export function insertOpenWhenOpen(slug) {
  const store = readStore();
  const row = { id: nextId(store, 'open_when_opens'), slug, opened_at: now() };
  store.open_when_opens.push(row);
  writeStore(store);
  return row;
}

export function listOpenWhenOpens() {
  return readStore().open_when_opens.slice().sort((a, b) => b.id - a.id);
}
