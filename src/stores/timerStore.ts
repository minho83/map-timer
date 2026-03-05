import { create } from 'zustand';
import type { Lap, TimerState } from '../types';

interface TimerStore {
  state: TimerState;
  startTime: number | null;
  previousElapsed: number;
  laps: Lap[];
  nextLapId: number;

  start: () => void;
  stop: () => void;
  reset: () => void;
  addLap: (type: 'auto' | 'manual', label?: string, diff?: number) => void;
  getElapsed: () => number;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  state: 'idle',
  startTime: null,
  previousElapsed: 0,
  laps: [],
  nextLapId: 1,

  start: () => {
    set({ state: 'running', startTime: performance.now() });
  },

  stop: () => {
    const elapsed = get().getElapsed();
    set({ state: 'paused', previousElapsed: elapsed, startTime: null });
  },

  reset: () => {
    set({
      state: 'idle',
      startTime: null,
      previousElapsed: 0,
      laps: [],
      nextLapId: 1,
    });
  },

  addLap: (type, label, diff) => {
    const elapsed = get().getElapsed();
    const laps = get().laps;
    const lastLapTime = laps.length > 0 ? laps[laps.length - 1].timestamp : 0;
    const id = get().nextLapId;

    set({
      laps: [
        ...laps,
        {
          id,
          timestamp: elapsed,
          splitTime: elapsed - lastLapTime,
          type,
          label,
          detectedDiff: diff,
        },
      ],
      nextLapId: id + 1,
    });
  },

  getElapsed: () => {
    const { state, startTime, previousElapsed } = get();
    if (state === 'running' && startTime !== null) {
      return performance.now() - startTime + previousElapsed;
    }
    return previousElapsed;
  },
}));
