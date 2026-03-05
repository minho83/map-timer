import { useState } from 'react';
import { useAlarmStore } from '../../stores/alarmStore';
import { Button } from '../common/Button';
import { AlarmForm } from './AlarmForm';
import { AlarmPresets } from './AlarmPresets';
import { t } from '../../utils/i18n';
import { formatTime } from '../../utils/formatTime';
import type { Alarm } from '../../types';

export function AlarmPanel() {
  const alarms = useAlarmStore((s) => s.alarms);
  const removeAlarm = useAlarmStore((s) => s.removeAlarm);
  const updateAlarm = useAlarmStore((s) => s.updateAlarm);

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingAlarm(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary">{t.alarms}</h3>
        <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
          + {t.addAlarm}
        </Button>
      </div>

      <AlarmPresets />

      {alarms.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-2">설정된 알람이 없습니다</p>
      ) : (
        <div className="space-y-1">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`flex items-center gap-2 px-3 py-2 rounded bg-bg-tertiary border border-border/50 ${
                alarm.triggered ? 'border-danger/50 bg-danger/10' : ''
              }`}
            >
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alarm.enabled}
                  onChange={(e) => updateAlarm(alarm.id, { enabled: e.target.checked })}
                  className="mr-2"
                />
              </label>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{alarm.name}</div>
                <div className="text-xs text-text-muted">
                  구간 {formatTime(alarm.targetTime, 'HH:MM:SS')} 초과 시
                </div>
              </div>
              <button
                onClick={() => handleEdit(alarm)}
                className="text-text-muted hover:text-text-primary text-xs cursor-pointer"
              >
                수정
              </button>
              <button
                onClick={() => removeAlarm(alarm.id)}
                className="text-text-muted hover:text-danger text-xs cursor-pointer"
              >
                {t.deleteAlarm}
              </button>
            </div>
          ))}
        </div>
      )}

      <AlarmForm isOpen={isFormOpen} onClose={handleClose} editAlarm={editingAlarm} />
    </div>
  );
}
