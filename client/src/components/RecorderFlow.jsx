import { CONFIG } from '../config';
import { CallPhoto } from './CallPhoto';

export default function RecorderScreen({
  attempt,
  bars,
  isRecording,
  durationMs,
  onStart,
  onStop,
  showMicHelper = false,
}) {
  return (
    <div className="screen call-active">
      <div className="call-top">
        <span>
          <span className="connected-dot" />
          Connected
        </span>
        <span>{CONFIG.yourName}</span>
      </div>

      <CallPhoto className="caller-photo" alt={CONFIG.yourName} />

      <p className="passphrase-hint">
        {attempt === 1 ? 'You know what to say.' : 'Again. Louder this time.'}
      </p>

      <div className="waveform-wrap">
        <div className={`waveform ${isRecording ? 'waveform--recording' : ''}`}>
          {bars.map((h, i) => (
            <span key={i} style={{ height: `${h}px` }} />
          ))}
        </div>
      </div>

      <p className="rec-timer">{formatDuration(durationMs)}</p>

      <div className="rec-controls">
        {!isRecording ? (
          <div className="mic-wrap">
            {showMicHelper && (
              <div className="mic-helper" aria-hidden>
                <span className="mic-helper__text">tap the mic</span>
                <span className="mic-helper__arrow">↓</span>
              </div>
            )}
            <button type="button" className="mic-btn" onClick={onStart} aria-label="Record">
              🎤
            </button>
          </div>
        ) : (
          <button type="button" className="stop-btn" onClick={onStop} aria-label="Stop">
            STOP
          </button>
        )}
      </div>
    </div>
  );
}

export function VerifyingScreen() {
  return (
    <div className="screen verifying">
      <div className="spinner" />
      <p>Checking passphrase…</p>
    </div>
  );
}

export function TeaseScreen({ onRetry }) {
  return (
    <div className="screen">
      <div className="message-card message-card--tease">
        <p>passphrase declined, neeeds more enthusiasm!!!</p>
      </div>
      <button type="button" className="btn btn--pink" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export function PunchlineScreen({ onContinue }) {
  return (
    <div className="screen">
      <div className="message-card">
        <p>
          woahh relaks relaks, there was no passphrase😂, i just wanted you to display a little.
        </p>
      </div>
      <button type="button" className="btn btn--primary" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
