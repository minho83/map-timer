import { useRef, useEffect, useCallback } from 'react';
import { useROISelector } from '../../hooks/useROISelector';
import { useCaptureStore } from '../../stores/captureStore';
import { Button } from '../common/Button';
import { t } from '../../utils/i18n';

interface ROISelectorProps {
  snapshotDataUrl: string;
  streamDimensions: { width: number; height: number };
  onClose: () => void;
}

export function ROISelector({ snapshotDataUrl, streamDimensions, onClose }: ROISelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const setROI = useCaptureStore((s) => s.setROI);
  const setSelectingROI = useCaptureStore((s) => s.setSelectingROI);

  const { selectionRect, isDone, onMouseDown, onMouseMove, onMouseUp, reset } =
    useROISelector(streamDimensions);

  // Load snapshot image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.src = snapshotDataUrl;
  }, [snapshotDataUrl]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    canvas.width = streamDimensions.width;
    canvas.height = streamDimensions.height;
    const ctx = canvas.getContext('2d')!;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cut out selected area
    if (selectionRect) {
      ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
      ctx.drawImage(
        img,
        selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height,
        selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height
      );

      // Border
      ctx.strokeStyle = '#4f8fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);

      // Dimensions label
      ctx.fillStyle = '#4f8fff';
      ctx.font = '14px monospace';
      ctx.fillText(
        `${selectionRect.width} x ${selectionRect.height}`,
        selectionRect.x,
        selectionRect.y - 6
      );
    }
  }, [selectionRect, streamDimensions]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleConfirm = () => {
    if (selectionRect) {
      setROI(selectionRect);
      setSelectingROI(false);
      onClose();
    }
  };

  const handleReselect = () => {
    reset();
    // Redraw clean canvas
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (canvas && img) {
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleCancel = () => {
    setSelectingROI(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <p className="text-text-secondary text-sm mb-3">{t.roiGuide}</p>
      <div className="relative max-w-full max-h-[70vh] overflow-auto">
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          className="cursor-crosshair max-w-full"
          style={{ maxHeight: '65vh', objectFit: 'contain' }}
        />
      </div>
      <div className="flex gap-2 mt-4">
        {isDone ? (
          <>
            <Button variant="success" onClick={handleConfirm}>
              {t.confirm}
            </Button>
            <Button variant="ghost" onClick={handleReselect}>
              {t.reselect}
            </Button>
          </>
        ) : null}
        <Button variant="danger" onClick={handleCancel}>
          {t.cancel}
        </Button>
      </div>
    </div>
  );
}
