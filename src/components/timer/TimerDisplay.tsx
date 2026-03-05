import { formatTime } from '../../utils/formatTime';
import { useSettingsStore } from '../../stores/settingsStore';

interface TimerDisplayProps {
  displayTime: number;
  compact?: boolean;
}

export function TimerDisplay({ displayTime, compact = false }: TimerDisplayProps) {
  const format = useSettingsStore((s) => s.displayFormat);

  return (
    <div className={`font-[var(--font-mono)] tabular-nums tracking-wider text-center select-none ${compact ? 'text-2xl' : 'text-3xl md:text-5xl'}`}>
      <span className="text-timer-digits drop-shadow-[0_0_12px_rgba(0,255,136,0.4)]">
        {formatTime(displayTime, format)}
      </span>
    </div>
  );
}
