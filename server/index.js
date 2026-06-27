import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  clearWishes,
  hasWish,
  insertFutureMessage,
  insertOpenWhenOpen,
  insertWish,
  listFutureMessages,
  listOpenWhenOpens,
  listWishes,
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'poca-test-reset';

app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/tobi.jpeg', (_req, res) => {
  const candidates = [
    process.env.PHOTO_FILE,
    path.join(projectRoot, 'client', 'dist', 'tobi.jpeg'),
    path.join(projectRoot, 'client', 'public', 'tobi.jpeg'),
    path.join(projectRoot, 'client', 'src', 'assets', 'tobi.jpeg'),
    path.join(projectRoot, 'tobi.jpeg'),
  ].filter(Boolean);

  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) return res.status(404).end();
  res.sendFile(path.resolve(file));
});

app.post('/api/wish', (req, res) => {
  const { wish } = req.body;
  if (!wish || typeof wish !== 'string' || !wish.trim()) {
    return res.status(400).json({ error: 'Wish required' });
  }
  const row = insertWish(wish.trim().slice(0, 500));
  res.json({ ok: true, id: row.id });
});

app.get('/api/wishes', (_req, res) => {
  res.json(listWishes());
});

app.get('/api/wish/status', (_req, res) => {
  res.json({ completed: hasWish() });
});

app.post('/api/admin/reset', (req, res) => {
  const secret = req.body?.secret;
  if (!secret || secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  clearWishes();
  res.json({ ok: true, cleared: 'wishes' });
});

app.get('/__reset', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin-reset.html'));
});

app.post('/api/future-self', (req, res) => {
  const { message, unlockAt } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }
  const row = insertFutureMessage(message.trim().slice(0, 2000), unlockAt || null);
  res.json({ ok: true, id: row.id });
});

app.get('/api/future-self', (_req, res) => {
  res.json(listFutureMessages());
});

app.post('/api/open-when/open', (req, res) => {
  const { slug } = req.body;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug required' });
  }
  insertOpenWhenOpen(slug.slice(0, 64));
  res.json({ ok: true });
});

app.get('/api/open-when/opens', (_req, res) => {
  res.json(listOpenWhenOpens());
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
