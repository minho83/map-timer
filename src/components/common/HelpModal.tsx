import { Modal } from './Modal';
import { t } from '../../utils/i18n';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-sm font-semibold text-accent mb-1.5">{title}</h4>
      <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
        {children}
      </div>
    </div>
  );
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.helpTitle}>
      <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
        {/* Important Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2 mb-4">
          <p className="text-xs font-bold text-yellow-400">
            ⚠ 시작트리거 후 1초 정도 지연이 있을 수 있습니다
          </p>
        </div>

        <Section title={t.helpBasicUsage}>
          {t.helpBasicUsageDesc}
        </Section>

        <Section title={t.helpTriggers}>
          {t.helpTriggersDesc}
        </Section>

        <Section title={t.helpAlarms}>
          {t.helpAlarmsDesc}
        </Section>

        <Section title={t.helpShortcuts}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            <span><kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px] font-mono">Space</kbd> 시작/정지</span>
            <span><kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px] font-mono">Enter</kbd> 구간 기록</span>
            <span><kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px] font-mono">R</kbd> 초기화</span>
            <span><kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px] font-mono">M</kbd> 모드 전환</span>
            <span><kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px] font-mono">Esc</kbd> 알람 해제</span>
          </div>
        </Section>
      </div>
    </Modal>
  );
}
