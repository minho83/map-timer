import { useRef, useState, useEffect } from 'react';
import { useTimerStore } from '../stores/timerStore';

export function useTimer() {
  const store = useTimerStore();
  const [displayTime, setDisplayTime] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (store.state !== 'running') {
      setDisplayTime(store.previousElapsed);
      return;
    }

    const tick = () => {
      setDisplayTime(store.getElapsed());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [store.state, store.previousElapsed, store.getElapsed]);

  return {
    displayTime,
    timerState: store.state,
    laps: store.laps,
    start: store.start,
    stop: store.stop,
    reset: store.reset,
    addLap: store.addLap,
    getElapsed: store.getElapsed,
  };
}
