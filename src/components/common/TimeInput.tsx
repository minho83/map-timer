import { useState, useEffect, useCallback } from 'react';

interface TimeInputProps {
  value: number; // ms
  onChange: (ms: number) => void;
  label?: string;
}

const STEP_BUTTONS = [
  { label: '+10초', delta: 10 },
  { label: '+5초', delta: 5 },
  { label: '+1초', delta: 1 },
  { label: '-1초', delta: -1 },
  { label: '-5초', delta: -5 },
  { label: '-10초', delta: -10 },
];

export function TimeInput({ value, onChange, label }: TimeInputProps) {
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;

  const [minText, setMinText] = useState(String(m));
  const [secText, setSecText] = useState(String(s));

  // Sync local state when value prop changes externally
  useEffect(() => {
    const ts = Math.max(0, Math.floor(value / 1000));
    setMinText(String(Math.floor(ts / 60)));
    setSecText(String(ts % 60));
  }, [value]);

  const applyFromText = useCallback(
    (newMin: string, newSec: string) => {
      let mins = parseInt(newMin || '0', 10);
      let secs = parseInt(newSec || '0', 10);
      if (isNaN(mins)) mins = 0;
      if (isNaN(secs)) secs = 0;

      // Auto-convert: 60+ seconds rolls into minutes
      if (secs >= 60) {
        mins += Math.floor(secs / 60);
        secs = secs % 60;
      }
      if (secs < 0) {
        const borrow = Math.ceil(Math.abs(secs) / 60);
        mins -= borrow;
        secs += borrow * 60;
      }

      mins = Math.max(0, mins);
      secs = Math.max(0, secs);

      const ms = (mins * 60 + secs) * 1000;
      onChange(ms);
    },
    [onChange]
  );

  const handleStep = (deltaSec: number) => {
    const newTotal = Math.max(0, totalSeconds + deltaSec);
    onChange(newTotal * 1000);
  };

  const formatDisplay = () => {
    if (totalSeconds === 0) return '0초';
    const parts: string[] = [];
    if (m > 0) parts.push(`${m}분`);
    if (s > 0) parts.push(`${s}초`);
    return parts.join(' ');
  };

  return (
    <div>
      {label && <label className="block text-xs text-text-secondary mb-1.5">{label}</label>}

      {/* Current display */}
      <div className="text-sm text-accent font-medium mb-2">
        {formatDisplay()}
      </div>

      {/* Text input: minutes and seconds */}
      <div className="flex items-center gap-1.5 mb-2">
        <input
          type="number"
          min="0"
          max="999"
          value={minText}
          onChange={(e) => {
            setMinText(e.target.value);
            applyFromText(e.target.value, secText);
          }}
          onBlur={() => {
            // Normalize on blur
            applyFromText(minText, secText);
          }}
          className="w-16 bg-bg-tertiary border border-border rounded px-2 py-1 text-center text-sm text-text-primary"
        />
        <span className="text-xs text-text-secondary">분</span>
        <input
          type="number"
          min="0"
          max="59"
          value={secText}
          onChange={(e) => {
            setSecText(e.target.value);
            applyFromText(minText, e.target.value);
          }}
          onBlur={() => {
            applyFromText(minText, secText);
          }}
          className="w-16 bg-bg-tertiary border border-border rounded px-2 py-1 text-center text-sm text-text-primary"
        />
        <span className="text-xs text-text-secondary">초</span>
      </div>

      {/* +/- step buttons */}
      <div className="flex gap-1 flex-wrap">
        {STEP_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => handleStep(btn.delta)}
            className={`text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${
              btn.delta > 0
                ? 'bg-bg-tertiary border-border hover:border-accent hover:text-accent text-text-secondary'
                : 'bg-bg-tertiary border-border hover:border-danger hover:text-danger text-text-secondary'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
