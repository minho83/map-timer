import { t } from '../../utils/i18n';
import { sensitivityToThreshold } from '../../utils/constants';
import { useSettingsStore } from '../../stores/settingsStore';

interface DetectionStatusProps {
  isDetecting: boolean;
  lastDiff: number;
  ocrText?: string;
  ocrLoading?: boolean;
  compact?: boolean;
}

export function DetectionStatus({ isDetecting, lastDiff, ocrText, ocrLoading, compact = false }: DetectionStatusProps) {
  const sensitivity = useSettingsStore((s) => s.sensitivity);
  const threshold = sensitivityToThreshold(sensitivity);

  const ratio = threshold > 0 ? lastDiff / threshold : 0;
  const dotColor = !isDetecting
    ? 'bg-text-muted'
    : ratio > 1
      ? 'bg-danger animate-pulse'
      : ratio > 0.5
        ? 'bg-warning'
        : 'bg-success';

  if (compact) {
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {isDetecting ? t.detecting : t.detectionOff}
        </div>
        {ocrText && (
          <div className="text-xs text-accent truncate" title={ocrText}>
            OCR: {ocrText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      <span className="text-text-secondary">
        {isDetecting ? t.detecting : t.detectionOff}
      </span>
      {isDetecting && (
        <span className="text-xs text-text-muted font-[var(--font-mono)]">
          {t.diffScore}: {lastDiff.toFixed(1)} / {threshold.toFixed(0)}
        </span>
      )}
      {ocrLoading && (
        <span className="text-[10px] text-accent animate-pulse">OCR...</span>
      )}
    </div>
  );
}
