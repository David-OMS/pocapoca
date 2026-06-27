import { useEffect, useState } from 'react';

export default function CakeWish({ onWishSubmit, onComplete }) {
  const [wish, setWish] = useState('');
  const [blown, setBlown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowModal(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!blown || !onComplete) return;
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [blown, onComplete]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!wish.trim()) {
      setError('dont be shyy, make a wish');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onWishSubmit(wish.trim());
      setSuccess('the genie has received your wish');
      setShowModal(false);
      setTimeout(() => setBlown(true), 900);
    } catch {
      setSuccess('the genie has received your wish');
      setShowModal(false);
      setTimeout(() => setBlown(true), 900);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen cake-screen">
      <div className="cake-wrap">
        <svg className="cake-svg" viewBox="0 0 160 140" aria-hidden>
          <ellipse cx="80" cy="120" rx="70" ry="12" fill="#143d32" />
          <rect x="25" y="70" width="110" height="45" rx="8" fill="#ec4899" />
          <rect x="30" y="55" width="100" height="20" rx="6" fill="#f472b6" />
          <rect x="53" y="25" width="8" height="35" fill="#f8fafc" />
          <rect x="76" y="25" width="8" height="35" fill="#f8fafc" />
          <rect x="99" y="25" width="8" height="35" fill="#f8fafc" />
          {[57, 80, 103].map((x) => (
            <ellipse
              key={x}
              className={`candle-flame ${blown ? 'candle-flame--out' : ''}`}
              cx={x}
              cy="22"
              rx="8"
              ry="12"
              fill="#fbbf24"
            />
          ))}
        </svg>
      </div>

      {success && <p className="wish-success">{success}</p>}

      {showModal && (
        <div className="wish-modal" role="dialog" aria-modal="true">
          <form className="wish-form wish-form--modal" onSubmit={handleSubmit}>
            <h3>make a wish</h3>
            <textarea
              value={wish}
              onChange={(e) => {
                setWish(e.target.value);
                if (error) setError('');
              }}
              placeholder="type your wish here..."
              maxLength={500}
            />
            {error && <p className="wish-error">{error}</p>}
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'sending...' : 'done'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function EnjoyDayScreen({ onBackToLetter }) {
  return (
    <div className="screen enjoy-screen">
      <p className="enjoy-message">enjoy your day, muah</p>
      <span className="enjoy-emoji" aria-hidden>
        💋
      </span>
      {onBackToLetter && (
        <button type="button" className="btn btn--ghost enjoy-back-btn" onClick={onBackToLetter}>
          back to the not love letter
        </button>
      )}
    </div>
  );
}
