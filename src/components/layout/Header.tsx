import { useState } from 'react';
import { Button } from '../common/Button';
import { HelpModal } from '../common/HelpModal';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useSettingsStore } from '../../stores/settingsStore';
import { t } from '../../utils/i18n';

export function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const toggleViewMode = useSettingsStore((s) => s.toggleViewMode);
  const viewMode = useSettingsStore((s) => s.viewMode);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-text-primary leading-tight">{t.appTitle}</h1>
            <p className="text-[10px] text-text-muted">{t.appSubtitle} · {t.credit}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-0.5">
            <span className="text-[10px] font-semibold text-yellow-400">⚠ {t.triggerDelayNotice}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
            {t.help}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleViewMode}>
            {viewMode === 'full' ? t.compactMode : t.fullMode}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
            {t.settings}
          </Button>
        </div>
      </header>
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
