import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SensitivitySlider } from './SensitivitySlider';
import { SoundSelector } from './SoundSelector';
import { t } from '../../utils/i18n';
import { useSettingsStore } from '../../stores/settingsStore';
import type { DisplayFormat } from '../../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const settings = useSettingsStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.settings}>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
        {/* Display */}
        <section>
          <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            {t.displaySettings}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">{t.displayFormat}</label>
              <select
                value={settings.displayFormat}
                onChange={(e) => settings.updateSetting('displayFormat', e.target.value as DisplayFormat)}
                className="w-full bg-bg-tertiary border border-border rounded px-3 py-1.5 text-sm text-text-primary"
              >
                <option value="HH:MM:SS">HH:MM:SS</option>
                <option value="HH:MM:SS.s">HH:MM:SS.s</option>
                <option value="HH:MM:SS.ss">HH:MM:SS.ss</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">
                {t.compactOpacity}: {Math.round(settings.compactOpacity * 100)}%
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={settings.compactOpacity * 100}
                onChange={(e) => settings.updateSetting('compactOpacity', parseInt(e.target.value) / 100)}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Detection */}
        <section>
          <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            {t.detectionSettings}
          </h4>
          <div className="space-y-3">
            <SensitivitySlider />
            <div>
              <label className="block text-xs text-text-muted mb-1">
                {t.detectionInterval}: {settings.detectionInterval}ms
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={settings.detectionInterval}
                onChange={(e) => settings.updateSetting('detectionInterval', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">
                {t.debounceDelay}: {settings.debounceDelay}ms
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={settings.debounceDelay}
                onChange={(e) => settings.updateSetting('debounceDelay', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Alarm */}
        <section>
          <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            {t.alarmSettings}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">
                {t.volume}: {settings.alarmVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.alarmVolume}
                onChange={(e) => settings.updateSetting('alarmVolume', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <SoundSelector />
          </div>
        </section>

        {/* General */}
        <section>
          <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            {t.generalSettings}
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoDetect}
                onChange={(e) => settings.updateSetting('autoDetect', e.target.checked)}
              />
              {t.autoDetect}
            </label>
            <Button variant="ghost" size="sm" onClick={settings.resetSettings}>
              {t.resetSettings}
            </Button>
          </div>
        </section>
      </div>
    </Modal>
  );
}
