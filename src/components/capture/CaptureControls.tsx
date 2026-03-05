import { useState } from 'react';
import { Button } from '../common/Button';
import { t } from '../../utils/i18n';
import { useCaptureStore } from '../../stores/captureStore';
import { useScreenCapture } from '../../hooks/useScreenCapture';
import { useMapDetection } from '../../hooks/useMapDetection';
import { ROISelector } from './ROISelector';

export function CaptureControls() {
  const { isCapturing, startCapture, stopCapture, getSnapshot, streamDimensions } = useScreenCapture();
  const { isDetecting, startDetection, stopDetection } = useMapDetection();
  const roi = useCaptureStore((s) => s.roi);
  const setROI = useCaptureStore((s) => s.setROI);
  const isSelectingROI = useCaptureStore((s) => s.isSelectingROI);
  const setSelectingROI = useCaptureStore((s) => s.setSelectingROI);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  const handleROISelect = () => {
    const snap = getSnapshot();
    if (snap) {
      setSnapshot(snap);
      setSelectingROI(true);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {!isCapturing ? (
          <Button variant="primary" size="sm" onClick={startCapture}>
            {t.startCapture}
          </Button>
        ) : (
          <>
            <Button variant="danger" size="sm" onClick={stopCapture}>
              {t.stopCapture}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleROISelect}>
              {t.selectROI}
            </Button>
            {roi && (
              <Button variant="ghost" size="sm" onClick={() => setROI(null)}>
                {t.clearROI}
              </Button>
            )}
          </>
        )}
      </div>

      {isCapturing && roi && (
        <div className="flex items-center gap-2">
          {!isDetecting ? (
            <Button variant="success" size="sm" onClick={startDetection}>
              {t.startDetection}
            </Button>
          ) : (
            <Button variant="warning" size="sm" onClick={stopDetection}>
              {t.stopDetection}
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span>{isCapturing ? `${t.capturing} (${streamDimensions?.width}x${streamDimensions?.height})` : t.notCapturing}</span>
        <span>{roi ? t.roiSet : t.roiNotSet}</span>
      </div>

      {isSelectingROI && snapshot && streamDimensions && (
        <ROISelector
          snapshotDataUrl={snapshot}
          streamDimensions={streamDimensions}
          onClose={() => {
            setSelectingROI(false);
            setSnapshot(null);
          }}
        />
      )}
    </div>
  );
}
