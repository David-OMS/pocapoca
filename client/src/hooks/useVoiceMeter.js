import { useCallback, useEffect, useRef, useState } from 'react';

const MIC_TIMEOUT_MS = 3500;
const FRAME_MS = 33; // ~30fps — easier on weak phones

function getVolume(analyser, data) {
  analyser.getByteFrequencyData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += data[i];
  return sum / (data.length / 4);
}

export function useVoiceMeter() {
  const [bars, setBars] = useState(() => Array(24).fill(4));
  const [isRecording, setIsRecording] = useState(false);
  const [isFake, setIsFake] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [peakVolume, setPeakVolume] = useState(0);

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const peakRef = useRef(0);
  const isFakeRef = useRef(false);
  const fakePhaseRef = useRef(0);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    rafRef.current = null;
    intervalRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const tickFake = useCallback(() => {
    fakePhaseRef.current += 0.35;
    const phase = fakePhaseRef.current;
    setBars(
      Array.from({ length: 24 }, (_, i) => {
        const wave = Math.sin(phase + i * 0.45) * 0.5 + 0.5;
        const jitter = Math.random() * 0.35;
        return Math.round(8 + wave * 28 + jitter * 20);
      })
    );
    setDurationMs(Date.now() - startTimeRef.current);
    setPeakVolume((p) => Math.max(p, 42 + Math.random() * 18));
  }, []);

  const tickReal = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const vol = getVolume(analyser, data);
    peakRef.current = Math.max(peakRef.current, vol);
    setPeakVolume(peakRef.current);
    setDurationMs(Date.now() - startTimeRef.current);

    analyser.getByteFrequencyData(data);
    const step = Math.floor(data.length / 24);
    setBars(
      Array.from({ length: 24 }, (_, i) => {
        const v = data[i * step] || 0;
        return Math.max(4, Math.round((v / 255) * 40));
      })
    );
  }, []);

  const tryMic = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('mic timeout')), MIC_TIMEOUT_MS)
        ),
      ]);
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      streamRef.current = stream;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      return true;
    } catch {
      return false;
    }
  }, []);

  const start = useCallback(async () => {
    cleanup();
    peakRef.current = 0;
    setPeakVolume(0);
    setDurationMs(0);
    startTimeRef.current = Date.now();
    setIsRecording(true);

    const micOk = await tryMic();
    isFakeRef.current = !micOk;
    setIsFake(!micOk);

    if (micOk) {
      const loop = () => {
        tickReal();
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } else {
      intervalRef.current = setInterval(tickFake, FRAME_MS);
    }
  }, [cleanup, tryMic, tickFake, tickReal]);

  const stop = useCallback(() => {
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    intervalRef.current = null;
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setBars(Array(24).fill(4));
    return {
      durationMs: Date.now() - startTimeRef.current,
      peakVolume: peakRef.current,
      isFake: isFakeRef.current,
    };
  }, []);

  return { bars, isRecording, isFake, durationMs, peakVolume, start, stop };
}

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${s}:${tenths}`;
}

// Tune after testing on a real phone — normal talk ~15-25, shout ~45+
export const VOLUME_WHISPER = 22;
export const VOLUME_LOUD = 38;
export const MIN_DURATION_MS = 700;
