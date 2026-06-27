import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'poca-test-reset';

app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.post('/api/wish', (req, res) => {
  const { wish } = req.body;
  if (!wish || typeof wish !== 'string' || !wish.trim()) {
    return res.status(400).json({ error: 'Wish required' });
  }
  const stmt = db.prepare('INSERT INTO wishes (wish) VALUES (?)');
  const result = stmt.run(wish.trim().slice(0, 500));
  res.json({ ok: true, id: result.lastInsertRowid });
});

app.get('/api/wishes', (_req, res) => {
  const rows = db.prepare('SELECT id, wish, created_at FROM wishes ORDER BY id DESC').all();
  res.json(rows);
});

app.get('/api/wish/status', (_req, res) => {
  const row = db.prepare('SELECT id FROM wishes LIMIT 1').get();
  res.json({ completed: Boolean(row) });
});

app.post('/api/admin/reset', (req, res) => {
  const secret = req.body?.secret;
  if (!secret || secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  db.prepare('DELETE FROM wishes').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name = 'wishes'").run();
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
  const unlock = unlockAt || null;
  const stmt = db.prepare('INSERT INTO future_messages (message, unlock_at) VALUES (?, ?)');
  const result = stmt.run(message.trim().slice(0, 2000), unlock);
  res.json({ ok: true, id: result.lastInsertRowid });
});

app.get('/api/future-self', (_req, res) => {
  const rows = db
    .prepare('SELECT id, message, unlock_at, created_at FROM future_messages ORDER BY id DESC')
    .all();
  res.json(rows);
});

app.post('/api/open-when/open', (req, res) => {
  const { slug } = req.body;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug required' });
  }
  db.prepare('INSERT INTO open_when_opens (slug) VALUES (?)').run(slug.slice(0, 64));
  res.json({ ok: true });
});

app.get('/api/open-when/opens', (_req, res) => {
  const rows = db
    .prepare('SELECT slug, opened_at FROM open_when_opens ORDER BY id DESC')
    .all();
  res.json(rows);
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
