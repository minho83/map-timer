import { useSettingsStore } from '../../stores/settingsStore';
import { Header } from './Header';
import { FullDashboard } from './FullDashboard';
import { CompactMode } from './CompactMode';

export function AppLayout() {
  const viewMode = useSettingsStore((s) => s.viewMode);

  if (viewMode === 'compact') {
    return (
      <div className="min-h-screen flex items-start justify-center p-4">
        <CompactMode />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <FullDashboard />
    </div>
  );
}
