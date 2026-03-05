import { TimerDisplay } from '../timer/TimerDisplay';
import { LapHistory } from '../timer/LapHistory';
import { DetectionStatus } from '../capture/DetectionStatus';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTimer } from '../../hooks/useTimer';
import { useMapDetection } from '../../hooks/useMapDetection';
import { Button } from '../common/Button';
import { t } from '../../utils/i18n';

export function CompactMode() {
  const { displayTime, timerState, laps, start, stop, addLap } = useTimer();
  const { isDetecting, lastDiff, ocrText, ocrLoading } = useMapDetection();
  const compactOpacity = useSettingsStore((s) => s.compactOpacity);
  const toggleViewMode = useSettingsStore((s) => s.toggleViewMode);

  return (
    <div
      className="w-72 p-3 bg-bg-secondary rounded-lg border border-border space-y-2"
      style={{ opacity: compactOpacity }}
    >
      <div className="flex items-center justify-between">
        <TimerDisplay displayTime={displayTime} compact />
        <Button variant="ghost" size="sm" onClick={toggleViewMode}>
          {t.fullMode}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {timerState === 'running' ? (
          <Button variant="danger" size="sm" onClick={stop}>{t.stop}</Button>
        ) : (
          <Button variant="success" size="sm" onClick={start}>{t.start}</Button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={() => addLap('manual')}
          disabled={timerState !== 'running'}
        >
          {t.lap}
        </Button>
      </div>

      <LapHistory laps={laps} compact />
      <DetectionStatus isDetecting={isDetecting} lastDiff={lastDiff} ocrText={ocrText} ocrLoading={ocrLoading} compact />
    </div>
  );
}
