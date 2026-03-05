import { useEffect, useRef } from 'react';
import { useAlarmStore } from '../stores/alarmStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { audioManager } from '../services/audioManager';

export function useAlarms() {
  const alarms = useAlarmStore((s) => s.alarms);
  const activeAlarmId = useAlarmStore((s) => s.activeAlarmId);
  const triggerAlarm = useAlarmStore((s) => s.triggerAlarm);
  const dismissAlarm = useAlarmStore((s) => s.dismissAlarm);
  const resetAllTriggers = useAlarmStore((s) => s.resetAllTriggers);
  const timerState = useTimerStore((s) => s.state);
  const laps = useTimerStore((s) => s.laps);
  const getElapsed = useTimerStore((s) => s.getElapsed);
  const alarmVolume = useSettingsStore((s) => s.alarmVolume);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevLapCountRef = useRef(0);

  // Reset alarm triggers when a new lap is recorded (new section starts)
  useEffect(() => {
    if (laps.length > prevLapCountRef.current) {
      resetAllTriggers();
    }
    prevLapCountRef.current = laps.length;
  }, [laps.length, resetAllTriggers]);

  // Real-time: check current split time against alarm thresholds
  useEffect(() => {
    if (timerState !== 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = getElapsed();
      const currentLaps = useTimerStore.getState().laps;
      const lastLapTime = currentLaps.length > 0
        ? currentLaps[currentLaps.length - 1].timestamp
        : 0;
      const currentSplitTime = elapsed - lastLapTime;

      const currentAlarms = useAlarmStore.getState().alarms;
      for (const alarm of currentAlarms) {
        if (!alarm.enabled || alarm.triggered) continue;
        if (currentSplitTime >= alarm.targetTime) {
          triggerAlarm(alarm.id);
          audioManager.play(alarm.soundFile, alarmVolume);
          break;
        }
      }
    }, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState, getElapsed, triggerAlarm, alarmVolume]);

  const activeAlarm = alarms.find((a) => a.id === activeAlarmId) || null;

  return {
    alarms,
    activeAlarm,
    dismissAlarm,
  };
}
