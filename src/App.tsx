import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AlarmNotification } from './components/alarm/AlarmNotification';
import { useAlarms } from './hooks/useAlarms';
import { useTimerStore } from './stores/timerStore';
import { useSettingsStore } from './stores/settingsStore';
import { useAlarmStore } from './stores/alarmStore';

export default function App() {
  const { activeAlarm, dismissAlarm } = useAlarms();
  const timerState = useTimerStore((s) => s.state);
  const start = useTimerStore((s) => s.start);
  const stop = useTimerStore((s) => s.stop);
  const reset = useTimerStore((s) => s.reset);
  const addLap = useTimerStore((s) => s.addLap);
  const toggleViewMode = useSettingsStore((s) => s.toggleViewMode);
  const resetAllTriggers = useAlarmStore((s) => s.resetAllTriggers);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (timerState === 'running') {
            stop();
          } else {
            start();
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (timerState === 'running') {
            addLap('manual');
          }
          break;
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (timerState !== 'idle') {
              reset();
              resetAllTriggers();
            }
          }
          break;
        case 'KeyM':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleViewMode();
          }
          break;
        case 'Escape':
          if (activeAlarm) {
            dismissAlarm();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerState, start, stop, reset, addLap, toggleViewMode, activeAlarm, dismissAlarm, resetAllTriggers]);

  return (
    <>
      <AppLayout />
      {activeAlarm && (
        <AlarmNotification alarm={activeAlarm} onDismiss={dismissAlarm} />
      )}
    </>
  );
}
