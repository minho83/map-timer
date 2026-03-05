import { useSettingsStore } from '../../stores/settingsStore';
import { sensitivityToThreshold } from '../../utils/constants';
import { t } from '../../utils/i18n';

export function SensitivitySlider() {
  const sensitivity = useSettingsStore((s) => s.sensitivity);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const threshold = sensitivityToThreshold(sensitivity);

  return (
    <div>
      <label className="block text-xs text-text-muted mb-1">
        {t.sensitivityLabel}: {sensitivity}% (threshold: {threshold.toFixed(1)})
      </label>
      <input
        type="range"
        min="1"
        max="100"
        value={sensitivity}
        onChange={(e) => updateSetting('sensitivity', parseInt(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
        <span>둔감</span>
        <span>민감</span>
      </div>
    </div>
  );
}
