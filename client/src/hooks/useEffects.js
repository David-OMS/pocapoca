import { useEffect, useRef } from 'react';

export function useConfettiBurst(active, durationMs = 2800) {
  const done = useRef(false);

  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;

    const colors = ['#ec4899', '#f472b6', '#fbcfe8', '#fdf2f8', '#a7c4bc'];
    const container = document.createElement('div');
    container.className = 'confetti-layer';
    document.body.appendChild(container);

    const spawnWave = (count) => {
      for (let i = 0; i < count; i++) {
        const el = document.createElement('span');
        el.className = 'confetti-piece';
        el.style.left = `${Math.random() * 100}%`;
        el.style.background = colors[i % colors.length];
        el.style.animationDelay = `${Math.random() * 0.5}s`;
        el.style.animationDuration = `${2.4 + Math.random() * 1.1}s`;
        container.appendChild(el);
      }
    };

    spawnWave(22);
    const wave2 = setTimeout(() => spawnWave(18), 450);
    const wave3 = setTimeout(() => spawnWave(12), 950);

    const removeAt = durationMs + 1800;
    const t = setTimeout(() => container.remove(), removeAt);
    return () => {
      clearTimeout(wave2);
      clearTimeout(wave3);
      clearTimeout(t);
      container.remove();
    };
  }, [active, durationMs]);
}

export function useRingtone(active) {
  useEffect(() => {
    if (!active) return;
    let ctx;
    let interval;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const beep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      };
      beep();
      interval = setInterval(beep, 1400);
    } catch {
      /* silent fail on bad phones */
    }
    return () => {
      clearInterval(interval);
      ctx?.close().catch(() => {});
    };
  }, [active]);
}
