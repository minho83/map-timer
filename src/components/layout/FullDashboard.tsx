import { TimerDisplay } from '../timer/TimerDisplay';
import { TimerControls } from '../timer/TimerControls';
import { LapHistory } from '../timer/LapHistory';
import { ScreenPreview } from '../capture/ScreenPreview';
import { CaptureControls } from '../capture/CaptureControls';
import { DetectionStatus } from '../capture/DetectionStatus';
import { OcrTriggerSettings } from '../capture/OcrTriggerSettings';
import { AlarmPanel } from '../alarm/AlarmPanel';
import { useTimer } from '../../hooks/useTimer';
import { useScreenCapture } from '../../hooks/useScreenCapture';
import { useMapDetection } from '../../hooks/useMapDetection';
import { useCaptureStore } from '../../stores/captureStore';

export function FullDashboard() {
  const { displayTime, timerState, laps, start, stop, reset, addLap } = useTimer();
  const { videoRef, isCapturing, streamDimensions } = useScreenCapture();
  const { isDetecting, lastDiff, ocrText, ocrLoading } = useMapDetection();
  const roi = useCaptureStore((s) => s.roi);

  return (
    <div className="flex gap-4 p-4 min-h-[calc(100vh-64px)]">
      {/* Left Panel - Capture & OCR Settings */}
      <div className="w-[340px] shrink-0 space-y-3">
        <ScreenPreview
          videoRef={videoRef}
          isCapturing={isCapturing}
          roi={roi}
          streamDimensions={streamDimensions}
        />
        <CaptureControls />
        <DetectionStatus isDetecting={isDetecting} lastDiff={lastDiff} ocrText={ocrText} ocrLoading={ocrLoading} />
        <OcrTriggerSettings />
      </div>

      {/* Right Panel - Timer & Alarms */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Timer */}
        <div className="bg-bg-secondary rounded-lg border border-border p-6 space-y-4">
          <TimerDisplay displayTime={displayTime} />
          <TimerControls
            timerState={timerState}
            onStart={start}
            onStop={stop}
            onReset={reset}
            onLap={() => addLap('manual')}
          />
        </div>

        {/* Lap History */}
        <div className="bg-bg-secondary rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-2">구간 기록</h3>
          <LapHistory laps={laps} />
        </div>

        {/* Alarms */}
        <div className="bg-bg-secondary rounded-lg border border-border p-4">
          <AlarmPanel />
        </div>
      </div>
    </div>
  );
}
