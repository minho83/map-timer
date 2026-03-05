import { useAlarmStore } from '../../stores/alarmStore';
import { ALARM_PRESETS } from '../../utils/constants';

export function AlarmPresets() {
  const addAlarm = useAlarmStore((s) => s.addAlarm);

  const handlePreset = (label: string, ms: number) => {
    addAlarm({
      name: `${label} 알람`,
      targetTime: ms,
      soundFile: 'alarm-default',
      visual: { flash: true, colorChange: true, overlay: true },
      enabled: true,
    });
  };

  return (
    <div className="flex gap-1 flex-wrap">
      {ALARM_PRESETS.map((preset) => (
        <button
          key={preset.label}
          onClick={() => handlePreset(preset.label, preset.ms)}
          className="text-xs px-2 py-1 rounded bg-bg-tertiary border border-border hover:border-accent hover:text-accent transition-colors cursor-pointer text-text-secondary"
        >
          +{preset.label}
        </button>
      ))}
    </div>
  );
}
