import { Button } from '../common/Button';
import { t } from '../../utils/i18n';
import type { TimerState } from '../../types';

interface TimerControlsProps {
  timerState: TimerState;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onLap: () => void;
}

export function TimerControls({ timerState, onStart, onStop, onReset, onLap }: TimerControlsProps) {
  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      {timerState === 'running' ? (
        <Button variant="danger" size="md" onClick={onStop}>
          {t.stop}
        </Button>
      ) : (
        <Button variant="success" size="md" onClick={onStart}>
          {t.start}
        </Button>
      )}
      <Button variant="ghost" size="md" onClick={onReset} disabled={timerState === 'idle'}>
        {t.reset}
      </Button>
      <Button variant="primary" size="md" onClick={onLap} disabled={timerState !== 'running'}>
        {t.lap}
      </Button>
    </div>
  );
}
