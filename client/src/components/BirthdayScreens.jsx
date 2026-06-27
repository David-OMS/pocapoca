import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';

function BirthdayBody() {
  return (
    <>
      <p className="birthday-text">{CONFIG.birthdayMessage}</p>
      {CONFIG.photos.length > 0 && (
        <div className="photo-grid">
          {CONFIG.photos.map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" decoding="async" />
          ))}
        </div>
      )}
    </>
  );
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const DRAG_DAMPING = 0.75;
const DRAG_EDGE_SLACK = 56;

function getGlassesDragBounds(glassesWidth, glassesHeight, contentRect) {
  let minX = -DRAG_EDGE_SLACK;
  let maxX = window.innerWidth - glassesWidth + DRAG_EDGE_SLACK;
  let minY = -DRAG_EDGE_SLACK;
  let maxY = window.innerHeight - glassesHeight + DRAG_EDGE_SLACK;

  if (contentRect) {
    minX = Math.min(minX, contentRect.left - glassesWidth * 0.06);
    maxX = Math.max(maxX, contentRect.right - glassesWidth * 0.94);
    minY = Math.min(minY, contentRect.top - glassesHeight * 0.35);
    maxY = Math.max(maxY, contentRect.bottom - glassesHeight * 0.65);
  }

  return { minX, maxX, minY, maxY };
}

function GlassesShowcase() {
  return (
    <div className="glasses-showcase">
      <div className="glasses-showcase__frame" aria-hidden>
        <div className="glasses-showcase__lens glasses-showcase__lens--left" />
        <div className="glasses-showcase__bridge" />
        <div className="glasses-showcase__lens glasses-showcase__lens--right" />
      </div>
    </div>
  );
}

function LensReveal({ lensRef, lensRect, contentRect }) {
  if (!lensRect || !contentRect) return null;

  return (
    <div
      className="glasses-clear-copy"
      style={{
        width: `${contentRect.width}px`,
        transform: `translate(${contentRect.left - lensRect.left}px, ${
          contentRect.top - lensRect.top
        }px)`,
      }}
    >
      <BirthdayBody />
    </div>
  );
}

function playDoneAudio() {
  if (!CONFIG.areYouDoneAudio) return;
  const audio = new Audio(CONFIG.areYouDoneAudio);
  audio.volume = 0.9;
  audio.play().catch(() => {
    // Some low-end/in-app browsers may block delayed audio. The popup still works.
  });
}

export default function BirthdayScreen({ onDone }) {
  const [phase, setPhase] = useState('confetti');
  const [contentRect, setContentRect] = useState(null);
  const [leftLensRect, setLeftLensRect] = useState(null);
  const [rightLensRect, setRightLensRect] = useState(null);
  const [glassesPos, setGlassesPos] = useState(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [readingStarted, setReadingStarted] = useState(false);
  const [showRemoveGlasses, setShowRemoveGlasses] = useState(false);
  const [donePrompt, setDonePrompt] = useState(null);
  const [dismissedDonePrompts, setDismissedDonePrompts] = useState(0);
  const [showFinalDone, setShowFinalDone] = useState(false);

  const scrollerRef = useRef(null);
  const contentRef = useRef(null);
  const glassesRef = useRef(null);
  const leftLensRef = useRef(null);
  const rightLensRef = useRef(null);
  const dragRef = useRef(null);

  const syncLensPosition = useCallback(() => {
    if (!contentRef.current) return;
    setContentRect(contentRef.current.getBoundingClientRect());
    if (leftLensRef.current) setLeftLensRect(leftLensRef.current.getBoundingClientRect());
    if (rightLensRef.current) setRightLensRect(rightLensRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (phase !== 'confetti') return;
    const t = setTimeout(() => setPhase('content'), 2800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'content') return;
    const t = setTimeout(() => setPhase('prompt'), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || (phase !== 'wearing' && phase !== 'clear')) return;
    syncLensPosition();
    el.addEventListener('scroll', syncLensPosition, { passive: true });
    window.addEventListener('resize', syncLensPosition);
    return () => {
      el.removeEventListener('scroll', syncLensPosition);
      window.removeEventListener('resize', syncLensPosition);
    };
  }, [phase, syncLensPosition]);

  useEffect(() => {
    if (phase !== 'wearing' || glassesPos) return;
    const width = Math.min(window.innerWidth * 0.88, 360);
    const height = Math.min(window.innerWidth * 0.34, 132);
    const content = contentRef.current?.getBoundingClientRect();
    const x = content
      ? content.left + content.width / 2 - width / 2
      : (window.innerWidth - width) / 2;
    const y = content
      ? content.top + 40
      : window.innerHeight * 0.34;
    const bounds = getGlassesDragBounds(width, height, content);
    setGlassesPos({
      x: clamp(x, bounds.minX, bounds.maxX),
      y: clamp(y, bounds.minY, bounds.maxY),
    });
  }, [phase, glassesPos]);

  useEffect(() => {
    if (phase !== 'wearing' || !glassesPos) return;
    const id = requestAnimationFrame(syncLensPosition);
    return () => cancelAnimationFrame(id);
  }, [phase, glassesPos, syncLensPosition]);

  useEffect(() => {
    if (!hasDragged || phase !== 'wearing') return;
    const t = setTimeout(() => setShowRemoveGlasses(true), 3500);
    return () => clearTimeout(t);
  }, [hasDragged, phase]);

  useEffect(() => {
    if (!readingStarted) return;
    const first = setTimeout(() => {
      setDonePrompt(1);
      playDoneAudio();
    }, 10500);
    return () => clearTimeout(first);
  }, [readingStarted]);

  useEffect(() => {
    if (dismissedDonePrompts !== 1) return;
    const second = setTimeout(() => {
      setDonePrompt(2);
      playDoneAudio();
    }, 7500);
    return () => clearTimeout(second);
  }, [dismissedDonePrompts]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || dismissedDonePrompts < 2) return;
    if (phase !== 'wearing' && phase !== 'clear') return;

    const checkEnd = () => {
      const nearEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
      const noScroll = el.scrollHeight <= el.clientHeight + 80;
      if (nearEnd || noScroll) setShowFinalDone(true);
    };

    checkEnd();
    const t = setTimeout(checkEnd, 100);
    el.addEventListener('scroll', checkEnd, { passive: true });
    window.addEventListener('resize', checkEnd);
    return () => {
      clearTimeout(t);
      el.removeEventListener('scroll', checkEnd);
      window.removeEventListener('resize', checkEnd);
    };
  }, [dismissedDonePrompts, phase]);

  const handlePutOn = () => {
    setPhase('wearing');
    setGlassesPos(null);
    setHasDragged(false);
    setReadingStarted(true);
    setShowRemoveGlasses(false);
    setDonePrompt(null);
    setDismissedDonePrompts(0);
    setShowFinalDone(false);
  };

  const handleDoneNo = () => {
    setDonePrompt(null);
    setDismissedDonePrompts((count) => Math.min(count + 1, 2));
  };

  const handleDoneYes = () => {
    setDonePrompt(null);
    setShowFinalDone(true);
  };

  const clearGlasses = () => {
    setPhase('clear');
    setShowRemoveGlasses(false);
  };

  const beginDrag = (event) => {
    if (!glassesRef.current || !glassesPos) return;
    const pointer = event.touches?.[0] || event;
    dragRef.current = {
      id: event.pointerId,
      startPointerX: pointer.clientX,
      startPointerY: pointer.clientY,
      startX: glassesPos.x,
      startY: glassesPos.y,
    };
    glassesRef.current.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragRef.current || !glassesRef.current) return;
    const pointer = event.touches?.[0] || event;
    const rect = glassesRef.current.getBoundingClientRect();
    const content = contentRef.current?.getBoundingClientRect();
    const bounds = getGlassesDragBounds(rect.width, rect.height, content);
    const nextX =
      dragRef.current.startX +
      (pointer.clientX - dragRef.current.startPointerX) * DRAG_DAMPING;
    const nextY =
      dragRef.current.startY +
      (pointer.clientY - dragRef.current.startPointerY) * DRAG_DAMPING;

    setHasDragged(true);
    setGlassesPos({
      x: clamp(nextX, bounds.minX, bounds.maxX),
      y: clamp(nextY, bounds.minY, bounds.maxY),
    });
  };

  const endDrag = (event) => {
    dragRef.current = null;
    glassesRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const showContent = phase !== 'confetti';
  const isWearing = phase === 'wearing';
  const showPrompt = phase === 'prompt';
  const isClear = phase === 'clear';
  const isReading = isWearing || isClear;

  return (
    <div
      className={`birthday-screen screen screen--scroll ${
        phase === 'confetti' ? 'birthday-screen--confetti-only' : ''
      } ${isWearing || isClear ? 'birthday-screen--reading' : ''}`}
      ref={scrollerRef}
    >
      {showContent && (
        <>
          <h1 className="title title--pink birthday-title">
            Appy birthday {CONFIG.herNickname} ❤️
          </h1>

          <div
            ref={contentRef}
            className={`birthday-content ${
              isClear ? 'birthday-content--clear' : 'birthday-content--blur'
            } ${
              isWearing ? 'birthday-content--behind-lenses' : ''
            }`}
          >
            <BirthdayBody />
          </div>
        </>
      )}

      {showPrompt && (
        <div className="glasses-prompt-backdrop">
          <div className="glasses-prompt" role="dialog" aria-live="polite">
            <p className="glasses-prompt__text">
              oh shit i forgot youre semi blind. here you go.
            </p>
            <GlassesShowcase />
            <button type="button" className="btn btn--pink" onClick={handlePutOn}>
              Put them on
            </button>
          </div>
        </div>
      )}

      {isWearing && (
        <>
          <div
            ref={glassesRef}
            className="draggable-glasses"
            style={{
              transform: glassesPos
                ? `translate3d(${glassesPos.x}px, ${glassesPos.y}px, 0)`
                : undefined,
            }}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            role="slider"
            aria-label="Move glasses to read the message"
          >
            <div className="glasses-lens glasses-lens--left" ref={leftLensRef}>
              <LensReveal
                lensRef={leftLensRef}
                lensRect={leftLensRect}
                contentRect={contentRect}
              />
            </div>
            <div className="glasses-bridge" />
            <div className="glasses-lens glasses-lens--right" ref={rightLensRef}>
              <LensReveal
                lensRef={rightLensRef}
                lensRect={rightLensRect}
                contentRect={contentRect}
              />
            </div>
          </div>
          <p className="lens-hint">Drag the glasses to read · scroll the page for more</p>
          {showRemoveGlasses && (
            <button
              type="button"
              className="remove-glasses-pop"
              onClick={clearGlasses}
            >
              if you want to read without the glasses, tap here to take them off.
            </button>
          )}
        </>
      )}
      {isReading && donePrompt && (
        <div className="done-check-pop" role="dialog" aria-live="polite">
          <p>are you doneeeee....</p>
          <div className="done-check-pop__actions">
            <button type="button" className="btn btn--pink" onClick={handleDoneYes}>
              yes
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleDoneNo}>
              no
            </button>
          </div>
        </div>
      )}
      {showFinalDone && (
        <button type="button" className="read-done-btn btn btn--primary" onClick={onDone}>
          im doneee
        </button>
      )}
    </div>
  );
}

export function LetterOnlyScreen() {
  return (
    <div className="birthday-screen screen screen--scroll birthday-screen--reading">
      <h1 className="title title--pink birthday-title">
        Appy birthday {CONFIG.herNickname} ❤️
      </h1>
      <div className="birthday-content birthday-content--clear">
        <BirthdayBody />
      </div>
    </div>
  );
}
