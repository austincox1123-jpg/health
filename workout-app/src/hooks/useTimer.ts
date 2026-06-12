import { useEffect, useRef, useState, useCallback } from 'react';

/** Counts up from a start time. Returns elapsed seconds. */
export function useElapsed(startTime: Date | null): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return startTime ? elapsed : 0;
}

interface CountdownState {
  remaining: number;
  running: boolean;
  start: (seconds: number) => void;
  extend: (seconds: number) => void;
  skip: () => void;
}

/** Rest timer: counts down to zero, can be extended or skipped. */
export function useCountdown(onDone?: () => void): CountdownState {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        doneRef.current?.();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback((seconds: number) => {
    endRef.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
    setRunning(true);
  }, []);

  const extend = useCallback((seconds: number) => {
    endRef.current += seconds * 1000;
    setRemaining((r) => r + seconds);
  }, []);

  const skip = useCallback(() => {
    setRunning(false);
    setRemaining(0);
  }, []);

  return { remaining, running, start, extend, skip };
}
