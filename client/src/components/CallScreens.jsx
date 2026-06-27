import { CONFIG } from '../config';

export function ProfileSelect({ onBirthdayGirl, onNotBirthdayGirl }) {
  return (
    <div className="screen profile-screen">
      <h1 className="title title--pink profile-screen__title">Who goes???</h1>
      <div className="profile-list">
        <button type="button" className="profile-card" onClick={onBirthdayGirl}>
          im the baidayy gurlll
        </button>
        <button
          type="button"
          className="profile-card profile-card--alt"
          onClick={onNotBirthdayGirl}
        >
          i&apos;m not the baidayy gurll
        </button>
      </div>
    </div>
  );
}

export function ImposterScreen({ onBack }) {
  return (
    <div className="screen profile-screen">
      <p className="imposter-message">
        see who said her frontal lobe has developed smh😂. go back jor
      </p>
      <button type="button" className="btn btn--ghost" onClick={onBack}>
        back
      </button>
    </div>
  );
}

export default function GateScreen({ onStart }) {
  return (
    <div className="screen gate-screen">
      <p className="subtitle gate-screen__sub">
        hmmm,... to prove its really you and not an impostor, you need to say the passphrase.
      </p>
      <button type="button" className="btn btn--primary" onClick={onStart}>
        Start
      </button>
    </div>
  );
}

export function IncomingCall({
  onAccept,
  declineDodged,
  declineGone,
  declineStyle,
  declineRoast,
  onDeclineAttempt,
}) {
  const initial = CONFIG.yourName.charAt(0).toUpperCase();

  return (
    <div className="screen call-screen-outer">
      <div className="phone-frame">
        <div className="phone-frame__bezel">
          <div className="phone-frame__speaker" />
        </div>

        <div className="phone-screen phone-screen--incoming">
          <div className="phone-status-bar">
            <span>9:41</span>
            <span className="phone-status-bar__icons">▮▮▮ WiFi 🔋</span>
          </div>

          <p className="incoming-label">Incoming call</p>

          <div className="caller-avatar-wrap">
            {CONFIG.yourPhoto ? (
              <img className="caller-photo-large" src={CONFIG.yourPhoto} alt={CONFIG.yourName} />
            ) : (
              <div className="caller-photo-large caller-photo--placeholder">{initial}</div>
            )}
            <span className="caller-avatar-ring" aria-hidden />
          </div>

          <h2 className="caller-name-large">{CONFIG.yourName}</h2>
          <p className="caller-line">mobile</p>
          <p className="caller-ringing">Ringing…</p>

          {declineRoast && (
            <div className="decline-roast" role="status">
              <p>{declineRoast}</p>
            </div>
          )}

          {declineDodged && !declineGone && (
            <button
              type="button"
              className="call-action__btn call-action__btn--decline call-action__btn--runaway"
              style={{ left: declineStyle.left, top: declineStyle.top }}
              onClick={onDeclineAttempt}
              aria-label="Decline"
            >
              <span className="call-action__icon">✕</span>
            </button>
          )}

          <div className="phone-call-actions">
            {!declineDodged && !declineGone ? (
              <div className="phone-call-actions__row">
                <div className="call-action">
                  <button
                    type="button"
                    className="call-action__btn call-action__btn--decline"
                    onClick={onDeclineAttempt}
                    aria-label="Decline"
                  >
                    <span className="call-action__icon">✕</span>
                  </button>
                  <span className="call-action__label">Decline</span>
                </div>
                <div className="call-action">
                  <button
                    type="button"
                    className="call-action__btn call-action__btn--accept"
                    onClick={onAccept}
                    aria-label="Accept"
                  >
                    <span className="call-action__icon">✓</span>
                  </button>
                  <span className="call-action__label">Accept</span>
                </div>
              </div>
            ) : (
              <div className="call-action call-action--fixed-accept">
                <button
                  type="button"
                  className="call-action__btn call-action__btn--accept"
                  onClick={onAccept}
                  aria-label="Accept"
                >
                  <span className="call-action__icon">✓</span>
                </button>
                <span className="call-action__label">Accept</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
