import { describe, it, expect, beforeEach } from 'vitest';
import { useTimerStore } from './timerStore';

describe('timerStore', () => {
  beforeEach(() => {
    useTimerStore.setState({
      state: 'idle',
      startTime: null,
      previousElapsed: 0,
      laps: [],
      nextLapId: 1,
    });
  });

  it('starts in idle state', () => {
    const state = useTimerStore.getState();
    expect(state.state).toBe('idle');
    expect(state.laps).toHaveLength(0);
    expect(state.previousElapsed).toBe(0);
  });

  it('transitions to running on start', () => {
    useTimerStore.getState().start();
    expect(useTimerStore.getState().state).toBe('running');
    expect(useTimerStore.getState().startTime).not.toBeNull();
  });

  it('transitions to paused on stop', () => {
    useTimerStore.getState().start();
    useTimerStore.getState().stop();
    expect(useTimerStore.getState().state).toBe('paused');
    expect(useTimerStore.getState().previousElapsed).toBeGreaterThanOrEqual(0);
  });

  it('resets all state', () => {
    useTimerStore.getState().start();
    useTimerStore.getState().addLap('manual');
    useTimerStore.getState().reset();

    const state = useTimerStore.getState();
    expect(state.state).toBe('idle');
    expect(state.laps).toHaveLength(0);
    expect(state.previousElapsed).toBe(0);
    expect(state.nextLapId).toBe(1);
  });

  it('adds manual laps', () => {
    useTimerStore.getState().start();
    useTimerStore.getState().addLap('manual', 'test');

    const laps = useTimerStore.getState().laps;
    expect(laps).toHaveLength(1);
    expect(laps[0].type).toBe('manual');
    expect(laps[0].label).toBe('test');
    expect(laps[0].id).toBe(1);
  });

  it('adds auto laps with diff', () => {
    useTimerStore.getState().start();
    useTimerStore.getState().addLap('auto', undefined, 42.5);

    const laps = useTimerStore.getState().laps;
    expect(laps[0].type).toBe('auto');
    expect(laps[0].detectedDiff).toBe(42.5);
  });

  it('calculates split times between laps', () => {
    useTimerStore.setState({ state: 'running', startTime: performance.now() - 5000, previousElapsed: 0 });
    useTimerStore.getState().addLap('manual');

    // Wait a bit and add another
    useTimerStore.setState({ startTime: performance.now() - 8000, previousElapsed: 0 });
    useTimerStore.getState().addLap('manual');

    const laps = useTimerStore.getState().laps;
    expect(laps).toHaveLength(2);
    expect(laps[1].splitTime).toBeGreaterThan(0);
    expect(laps[1].timestamp).toBeGreaterThan(laps[0].timestamp);
  });

  it('increments lap IDs', () => {
    useTimerStore.getState().start();
    useTimerStore.getState().addLap('manual');
    useTimerStore.getState().addLap('manual');
    useTimerStore.getState().addLap('auto');

    const laps = useTimerStore.getState().laps;
    expect(laps[0].id).toBe(1);
    expect(laps[1].id).toBe(2);
    expect(laps[2].id).toBe(3);
  });

  it('returns 0 elapsed when idle', () => {
    expect(useTimerStore.getState().getElapsed()).toBe(0);
  });
});
