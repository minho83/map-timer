import { useState } from 'react';
import { Button } from '../common/Button';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useSettingsStore } from '../../stores/settingsStore';
import { t } from '../../utils/i18n';

export function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const toggleViewMode = useSettingsStore((s) => s.toggleViewMode);
  const viewMode = useSettingsStore((s) => s.viewMode);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border">
        <div>
          <h1 className="text-lg font-bold text-text-primary">{t.appTitle}</h1>
          <p className="text-xs text-text-muted">{t.appSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleViewMode}
          >
            {viewMode === 'full' ? t.compactMode : t.fullMode}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            {t.settings}
          </Button>
        </div>
      </header>
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
