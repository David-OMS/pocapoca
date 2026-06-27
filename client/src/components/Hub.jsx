import { useState } from 'react';
import { OPEN_WHEN } from '../config';

async function logOpen(slug) {
  try {
    await fetch('/api/open-when/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
  } catch {
    /* offline ok */
  }
}

export default function Hub() {
  const [openLetter, setOpenLetter] = useState(null);
  const [futureText, setFutureText] = useState('');
  const [futureSaved, setFutureSaved] = useState(false);
  const [futureLoading, setFutureLoading] = useState(false);

  const openEnvelope = async (letter) => {
    setOpenLetter(letter);
    await logOpen(letter.slug);
  };

  const saveFuture = async (e) => {
    e.preventDefault();
    if (!futureText.trim() || futureLoading) return;
    setFutureLoading(true);
    try {
      await fetch('/api/future-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: futureText.trim() }),
      });
      setFutureSaved(true);
    } catch {
      setFutureSaved(true);
    } finally {
      setFutureLoading(false);
    }
  };

  return (
    <div className="screen screen--scroll">
      <p className="eyebrow">For later</p>
      <h2 className="title" style={{ fontSize: '1.35rem' }}>
        Open when…
      </h2>

      <div className="hub-grid">
        {OPEN_WHEN.map((letter) => (
          <button
            key={letter.slug}
            type="button"
            className="envelope-btn"
            onClick={() => openEnvelope(letter)}
          >
            ✉️ {letter.title}
          </button>
        ))}
      </div>

      {openLetter && (
        <div className="letter-panel">
          <h3>{openLetter.title}</h3>
          <p>{openLetter.body}</p>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ marginTop: '1rem', width: '100%' }}
            onClick={() => setOpenLetter(null)}
          >
            Close
          </button>
        </div>
      )}

      <div className="hub-section">
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--pink-light)' }}>
          Message for future you
        </h3>
        <p className="subtitle" style={{ marginBottom: '1rem' }}>
          Write something. We&apos;ll keep it for you.
        </p>
        {futureSaved ? (
          <p style={{ color: 'var(--emerald-light)' }}>Locked away. Future you will thank you.</p>
        ) : (
          <form className="wish-form" onSubmit={saveFuture}>
            <textarea
              value={futureText}
              onChange={(e) => setFutureText(e.target.value)}
              placeholder="Dear future me…"
              maxLength={2000}
              required
            />
            <button type="submit" className="btn btn--primary" disabled={futureLoading}>
              {futureLoading ? 'Saving…' : 'Save for later'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
