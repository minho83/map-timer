import { useState, useCallback, useRef } from 'react';
import type { ROIRect } from '../types';

interface Point {
  x: number;
  y: number;
}

export function useROISelector(canvasDimensions: { width: number; height: number } | null) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<ROIRect | null>(null);
  const [isDone, setIsDone] = useState(false);
  const startPoint = useRef<Point | null>(null);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDone || !canvasDimensions) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = canvasDimensions.width / rect.width;
      const scaleY = canvasDimensions.height / rect.height;
      startPoint.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
      setIsSelecting(true);
      setSelectionRect(null);
    },
    [isDone, canvasDimensions]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isSelecting || !startPoint.current || !canvasDimensions) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = canvasDimensions.width / rect.width;
      const scaleY = canvasDimensions.height / rect.height;
      const currentX = (e.clientX - rect.left) * scaleX;
      const currentY = (e.clientY - rect.top) * scaleY;

      const x = Math.min(startPoint.current.x, currentX);
      const y = Math.min(startPoint.current.y, currentY);
      const width = Math.abs(currentX - startPoint.current.x);
      const height = Math.abs(currentY - startPoint.current.y);

      setSelectionRect({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
        xNorm: x / canvasDimensions.width,
        yNorm: y / canvasDimensions.height,
        widthNorm: width / canvasDimensions.width,
        heightNorm: height / canvasDimensions.height,
      });
    },
    [isSelecting, canvasDimensions]
  );

  const onMouseUp = useCallback(() => {
    if (!isSelecting) return;
    setIsSelecting(false);
    if (selectionRect && selectionRect.width > 5 && selectionRect.height > 5) {
      setIsDone(true);
    } else {
      setSelectionRect(null);
    }
  }, [isSelecting, selectionRect]);

  const reset = useCallback(() => {
    setIsSelecting(false);
    setSelectionRect(null);
    setIsDone(false);
    startPoint.current = null;
  }, []);

  return {
    isSelecting,
    selectionRect,
    isDone,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    reset,
  };
}
