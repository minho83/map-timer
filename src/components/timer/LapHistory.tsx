import { useEffect, useRef, useState } from 'react';
import type { Lap } from '../../types';
import { formatTime, formatSplitTime } from '../../utils/formatTime';
import { t } from '../../utils/i18n';

interface LapHistoryProps {
  laps: Lap[];
  compact?: boolean;
}

function lapsToText(laps: Lap[]): string {
  const header = `#\t${t.splitTime}\t${t.totalTime}\t${t.lapType}\t${t.lapLabel}`;
  const rows = laps.map((lap) =>
    `${lap.id}\t${formatSplitTime(lap.splitTime)}\t${formatTime(lap.timestamp, 'HH:MM:SS.s')}\t${lap.type === 'auto' ? t.auto : t.manual}\t${lap.label || ''}`
  );
  return [header, ...rows].join('\n');
}

export function LapHistory({ laps, compact = false }: LapHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [laps.length]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lapsToText(laps));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (compact && laps.length > 0) {
    const latest = laps[laps.length - 1];
    return (
      <div className="text-xs text-text-secondary">
        {t.latestLap} #{latest.id}: {formatSplitTime(latest.splitTime)}
        {latest.type === 'auto' && ' (자동)'}
      </div>
    );
  }

  if (laps.length === 0) {
    return (
      <div className="text-center text-text-muted text-sm py-6">
        {t.noLaps}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Copy button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="text-[10px] text-text-muted hover:text-accent px-1.5 py-0.5 rounded border border-border/50 hover:border-accent/50 transition-colors"
        >
          {copied ? t.copiedToClipboard : t.copyLaps}
        </button>
      </div>

      <div ref={scrollRef} className="max-h-48 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-bg-secondary">
            <tr className="text-text-secondary text-xs border-b border-border">
              <th className="py-1.5 px-2 text-left w-10">#</th>
              <th className="py-1.5 px-2 text-right">{t.splitTime}</th>
              <th className="py-1.5 px-2 text-right">{t.totalTime}</th>
              <th className="py-1.5 px-2 text-center w-14">{t.lapType}</th>
              <th className="py-1.5 px-2 text-left">{t.lapLabel}</th>
            </tr>
          </thead>
          <tbody>
            {laps.map((lap) => (
              <tr
                key={lap.id}
                className={`border-b border-border/50 ${lap.type === 'auto' ? 'text-accent' : 'text-text-primary'}`}
              >
                <td className="py-1.5 px-2 font-[var(--font-mono)] text-xs">{lap.id}</td>
                <td className="py-1.5 px-2 text-right font-[var(--font-mono)]">
                  {formatSplitTime(lap.splitTime)}
                </td>
                <td className="py-1.5 px-2 text-right font-[var(--font-mono)]">
                  {formatTime(lap.timestamp, 'HH:MM:SS.s')}
                </td>
                <td className="py-1.5 px-2 text-center">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      lap.type === 'auto'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-bg-tertiary text-text-secondary'
                    }`}
                  >
                    {lap.type === 'auto' ? t.auto : t.manual}
                  </span>
                </td>
                <td className="py-1.5 px-2 text-xs text-text-muted truncate max-w-[100px]" title={lap.label}>
                  {lap.label || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
