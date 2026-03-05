import { useSettingsStore } from '../../stores/settingsStore';
import { SOUND_FILES } from '../../utils/constants';
import { audioManager } from '../../services/audioManager';
import { Button } from '../common/Button';
import { t } from '../../utils/i18n';

export function SoundSelector() {
  const selectedSound = useSettingsStore((s) => s.selectedAlarmSound);
  const alarmVolume = useSettingsStore((s) => s.alarmVolume);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  return (
    <div>
      <label className="block text-xs text-text-muted mb-1">{t.defaultSound}</label>
      <div className="flex gap-2">
        <select
          value={selectedSound}
          onChange={(e) => updateSetting('selectedAlarmSound', e.target.value)}
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
          onClick={() => audioManager.preview(selectedSound, alarmVolume)}
        >
          {t.preview}
        </Button>
      </div>
    </div>
  );
}
