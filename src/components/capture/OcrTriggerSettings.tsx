import { useState, useRef } from 'react';
import { Button } from '../common/Button';
import { t } from '../../utils/i18n';
import { useCaptureStore, type TriggerConfig } from '../../stores/captureStore';

type TriggerRole = keyof TriggerConfig;

const TRIGGER_ROLES: { role: TriggerRole; label: string; desc: string; color: string }[] = [
  { role: 'startTriggers', label: t.startTriggers, desc: t.startTriggersDesc, color: 'bg-success/15 text-success border-success/30' },
  { role: 'stopTriggers', label: t.stopTriggers, desc: t.stopTriggersDesc, color: 'bg-danger/15 text-danger border-danger/30' },
  { role: 'warningTriggers', label: t.warningTriggers, desc: t.warningTriggersDesc, color: 'bg-warning/15 text-warning border-warning/30' },
];

function TriggerSection({ role, label, desc, color }: { role: TriggerRole; label: string; desc: string; color: string }) {
  const triggers = useCaptureStore((s) => s.triggers[role]);
  const addTrigger = useCaptureStore((s) => s.addTrigger);
  const removeTrigger = useCaptureStore((s) => s.removeTrigger);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      addTrigger(role, trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAdd();
    }
  };

  return (
    <div className="space-y-1.5">
      <div>
        <span className="text-xs font-semibold text-text-primary">{label}</span>
        <p className="text-[10px] text-text-muted">{desc}</p>
      </div>
      <div className="flex gap-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.triggerTextPlaceholder}
          className="flex-1 bg-bg-tertiary border border-border rounded px-2 py-0.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent min-w-0"
        />
        <Button variant="ghost" size="sm" onClick={handleAdd} disabled={!inputValue.trim()}>
          {t.addTriggerText}
        </Button>
      </div>
      {triggers.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {triggers.map((text) => (
            <span
              key={text}
              className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border ${color}`}
            >
              {text}
              <button
                onClick={() => removeTrigger(role, text)}
                className="opacity-60 hover:opacity-100 font-bold leading-none"
                title="삭제"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-text-muted italic">{t.noTriggerTexts}</p>
      )}
    </div>
  );
}

export function OcrTriggerSettings() {
  const ocrEnabled = useCaptureStore((s) => s.ocrEnabled);
  const setOcrEnabled = useCaptureStore((s) => s.setOcrEnabled);
  const ocrText = useCaptureStore((s) => s.ocrText);
  const presets = useCaptureStore((s) => s.presets);
  const triggers = useCaptureStore((s) => s.triggers);
  const addPreset = useCaptureStore((s) => s.addPreset);
  const removePreset = useCaptureStore((s) => s.removePreset);
  const loadPreset = useCaptureStore((s) => s.loadPreset);
  const importPresets = useCaptureStore((s) => s.importPresets);
  const exportPresets = useCaptureStore((s) => s.exportPresets);

  const [presetName, setPresetName] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    addPreset({ name, config: { ...triggers } });
    setPresetName('');
  };

  const handleExport = () => {
    const json = exportPresets();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trigger-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importPresets(reader.result as string);
      setImportMsg(ok ? t.importSuccess : t.importFailed);
      setTimeout(() => setImportMsg(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-bg-secondary rounded-lg border border-border p-3 space-y-3">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {t.ocrTriggerSettings}
      </h4>

      {/* OCR Enable Toggle */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={ocrEnabled}
          onChange={(e) => setOcrEnabled(e.target.checked)}
          className="accent-accent"
        />
        <span className="text-text-primary">OCR 텍스트 인식</span>
      </label>

      {ocrEnabled && (
        <>
          {/* Current OCR text */}
          {ocrText && (
            <div className="bg-bg-tertiary rounded px-2.5 py-1.5 border border-border/50">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">{t.ocrCurrentText}</span>
              <div className="text-sm text-accent font-medium break-all">{ocrText}</div>
            </div>
          )}

          {/* Role-based trigger sections */}
          <div className="space-y-3 border-t border-border/50 pt-2">
            {TRIGGER_ROLES.map(({ role, label, desc, color }) => (
              <TriggerSection key={role} role={role} label={label} desc={desc} color={color} />
            ))}
          </div>

          {/* Presets */}
          <div className="border-t border-border/50 pt-2 space-y-2">
            <h5 className="text-xs font-semibold text-text-secondary">{t.presets}</h5>

            {/* Save preset */}
            <div className="flex gap-1">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleSavePreset(); } }}
                placeholder={t.presetNamePlaceholder}
                className="flex-1 bg-bg-tertiary border border-border rounded px-2 py-0.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent min-w-0"
              />
              <Button variant="primary" size="sm" onClick={handleSavePreset} disabled={!presetName.trim()}>
                {t.save}
              </Button>
            </div>

            {/* Preset list */}
            {presets.length > 0 && (
              <div className="space-y-1">
                {presets.map((p) => (
                  <div key={p.name} className="flex items-center gap-1 text-xs">
                    <span className="flex-1 text-text-primary truncate">{p.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => loadPreset(p.name)}>
                      {t.loadPreset}
                    </Button>
                    <button
                      onClick={() => removePreset(p.name)}
                      className="text-text-muted hover:text-danger text-xs px-1"
                      title={t.deletePreset}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Import / Export */}
            <div className="flex gap-1.5 items-center">
              <Button variant="ghost" size="sm" onClick={handleExport}>
                {t.exportConfig}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                {t.importConfig}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              {importMsg && (
                <span className={`text-[10px] ${importMsg === t.importSuccess ? 'text-success' : 'text-danger'}`}>
                  {importMsg}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
