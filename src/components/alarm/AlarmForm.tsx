import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TimeInput } from '../common/TimeInput';
import { t } from '../../utils/i18n';
import { SOUND_FILES } from '../../utils/constants';
import { audioManager } from '../../services/audioManager';
import { useAlarmStore } from '../../stores/alarmStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { Alarm } from '../../types';

interface AlarmFormProps {
  isOpen: boolean;
  onClose: () => void;
  editAlarm?: Alarm | null;
}

export function AlarmForm({ isOpen, onClose, editAlarm }: AlarmFormProps) {
  const addAlarm = useAlarmStore((s) => s.addAlarm);
  const updateAlarm = useAlarmStore((s) => s.updateAlarm);
  const alarmVolume = useSettingsStore((s) => s.alarmVolume);

  const [name, setName] = useState(editAlarm?.name || '');
  const [targetTime, setTargetTime] = useState(editAlarm?.targetTime || 300000);
  const [soundFile, setSoundFile] = useState(editAlarm?.soundFile || 'alarm-default');
  const [flash, setFlash] = useState(editAlarm?.visual.flash ?? true);
  const [colorChange, setColorChange] = useState(editAlarm?.visual.colorChange ?? true);
  const [overlay, setOverlay] = useState(editAlarm?.visual.overlay ?? true);

  const handleSubmit = () => {
    const alarmData = {
      name: name || '구간 초과 알람',
      targetTime,
      soundFile,
      visual: { flash, colorChange, overlay },
      enabled: true,
    };

    if (editAlarm) {
      updateAlarm(editAlarm.id, alarmData);
    } else {
      addAlarm(alarmData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editAlarm ? t.editAlarm : t.addAlarm}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1">{t.alarmName}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="알람 이름"
            className="w-full bg-bg-tertiary border border-border rounded px-3 py-1.5 text-sm text-text-primary"
          />
        </div>

        <TimeInput value={targetTime} onChange={setTargetTime} label={t.targetTime} />

        <div>
          <label className="block text-xs text-text-secondary mb-1">{t.soundSelect}</label>
          <div className="flex gap-2">
            <select
              value={soundFile}
              onChange={(e) => setSoundFile(e.target.value)}
              className="flex-1 bg-bg-tertiary border border-border rounded px-3 py-1.5 text-sm text-text-primary"
            >
              {SOUND_FILES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => audioManager.preview(soundFile, alarmVolume)}
            >
              {t.preview}
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-secondary mb-1">{t.visualOptions}</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={flash} onChange={(e) => setFlash(e.target.checked)} />
              {t.flash}
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={colorChange} onChange={(e) => setColorChange(e.target.checked)} />
              {t.colorChange}
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
              {t.overlay}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {t.save}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
