import { Button } from '../common/Button';
import { formatTime } from '../../utils/formatTime';
import { t } from '../../utils/i18n';
import type { Alarm } from '../../types';

interface AlarmNotificationProps {
  alarm: Alarm;
  onDismiss: () => void;
}

export function AlarmNotification({ alarm, onDismiss }: AlarmNotificationProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-pulse">
      {/* Flashing border overlay */}
      <div className="absolute inset-0 border-8 border-danger animate-[flash_0.5s_ease-in-out_infinite] pointer-events-none" />

      {/* Background dim */}
      <div className="absolute inset-0 bg-black/40" onClick={onDismiss} />

      {/* Notification card */}
      <div className="relative bg-bg-secondary border-2 border-danger rounded-xl p-8 text-center z-10 shadow-2xl shadow-danger/30 max-w-sm">
        <div className="text-5xl mb-4">
          {t.alarmTriggered}
        </div>
        <div className="text-xl font-bold text-danger mb-2">{alarm.name}</div>
        <div className="text-text-secondary text-sm mb-6">
          목표 시간: {formatTime(alarm.targetTime, 'HH:MM:SS')}
        </div>
        <Button variant="danger" size="lg" onClick={onDismiss}>
          {t.dismiss}
        </Button>
      </div>
    </div>
  );
}
