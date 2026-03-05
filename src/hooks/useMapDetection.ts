import { useEffect, useRef, useCallback } from 'react';
import { ImageComparisonService } from '../services/imageComparison';
import { screenCaptureService } from '../services/screenCapture';
import { ocrService } from '../services/ocrService';
import { useCaptureStore } from '../stores/captureStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { audioManager } from '../services/audioManager';
import { sensitivityToThreshold } from '../utils/constants';

/** Normalize OCR text: trim, collapse whitespace, lowercase */
function normalizeOcrText(text: string): string {
  return text.trim().replace(/\s+/g, '').toLowerCase();
}

/** Partial match helper */
function textMatches(ocrText: string, triggers: string[]): boolean {
  if (triggers.length === 0) return false;
  const normalized = normalizeOcrText(ocrText);
  return triggers.some((t) => normalized.includes(normalizeOcrText(t)));
}

/** Minimum split time (ms) to avoid micro-laps from OCR noise */
const MIN_OCR_SPLIT_TIME = 500;

export function useMapDetection() {
  const captureStore = useCaptureStore();
  const timerState = useTimerStore((s) => s.state);
  const timerStart = useTimerStore((s) => s.start);
  const timerStop = useTimerStore((s) => s.stop);
  const addLap = useTimerStore((s) => s.addLap);
  const getLaps = useTimerStore((s) => s.laps);
  const getElapsed = useTimerStore((s) => s.getElapsed);
  const { sensitivity, detectionInterval, debounceDelay, autoDetect } = useSettingsStore();

  const comparisonRef = useRef<ImageComparisonService | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const lastChangeTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ocrBusyRef = useRef(false);
  const ocrCounterRef = useRef(0);
  const prevOcrTextRef = useRef<string>('');

  const runOCR = useCallback(async (imageData: ImageData): Promise<string | null> => {
    if (ocrBusyRef.current || !captureStore.ocrEnabled) return null;
    ocrBusyRef.current = true;
    captureStore.setOcrLoading(true);

    try {
      const text = await ocrService.recognize(imageData);
      if (text) {
        captureStore.setOcrText(text);
        return text;
      }
      return null;
    } finally {
      ocrBusyRef.current = false;
      captureStore.setOcrLoading(false);
    }
  }, [captureStore]);

  /**
   * Handle OCR text with role-based triggers:
   * 1. Start triggers → start timer
   * 2. Stop triggers → stop timer
   * 3. Warning triggers → show alarm
   * 4. Any text change while running → record lap
   */
  const handleOcrResult = useCallback((newText: string, avgDiff: number) => {
    const { triggers } = useCaptureStore.getState();
    const currentState = useTimerStore.getState().state;
    const prevText = prevOcrTextRef.current;

    // Compare normalized text to avoid OCR noise (spaces, case differences)
    const normalizedNew = normalizeOcrText(newText);
    const normalizedPrev = normalizeOcrText(prevText);
    const textChanged = normalizedNew !== normalizedPrev;

    // Skip empty or very short OCR results (noise)
    if (normalizedNew.length < 2) return;

    prevOcrTextRef.current = newText;

    if (!textChanged) return;

    const isStartTrigger = textMatches(newText, triggers.startTriggers);
    const isStopTrigger = textMatches(newText, triggers.stopTriggers);
    const isWarningTrigger = textMatches(newText, triggers.warningTriggers);

    // 1. Stop trigger → stop timer (check first, higher priority)
    if (isStopTrigger && currentState === 'running') {
      addLap('auto', newText, avgDiff);
      timerStop();
      return;
    }

    // 2. Start trigger → start timer
    if (isStartTrigger && (currentState === 'idle' || currentState === 'paused')) {
      timerStart();
      return;
    }

    // 3. Warning trigger → play alarm sound
    if (isWarningTrigger && currentState === 'running') {
      const { alarmVolume } = useSettingsStore.getState();
      audioManager.play('alarm1', alarmVolume);
    }

    // 4. Text changed while running → record lap (with minimum split time check)
    if (currentState === 'running' && prevText !== '') {
      const elapsed = getElapsed();
      const currentLaps = useTimerStore.getState().laps;
      const lastLapTime = currentLaps.length > 0
        ? currentLaps[currentLaps.length - 1].timestamp
        : 0;
      const splitTime = elapsed - lastLapTime;

      // Skip if split time is too short (OCR transition noise)
      if (splitTime < MIN_OCR_SPLIT_TIME) return;

      addLap('auto', newText, avgDiff);
    }
  }, [timerStart, timerStop, addLap, getElapsed]);

  const startDetection = useCallback(() => {
    if (!captureStore.roi || !captureStore.isCapturing) return;
    if (comparisonRef.current) return;

    comparisonRef.current = new ImageComparisonService();
    prevFrameRef.current = null;
    ocrCounterRef.current = 0;
    prevOcrTextRef.current = '';
    captureStore.setDetecting(true);

    if (captureStore.ocrEnabled) {
      ocrService.init();
    }

    const threshold = sensitivityToThreshold(sensitivity);
    const roi = captureStore.roi;

    intervalRef.current = setInterval(async () => {
      if (!screenCaptureService.isCapturing || !comparisonRef.current) return;

      try {
        const imageData = screenCaptureService.captureROI({
          x: roi.x,
          y: roi.y,
          width: roi.width,
          height: roi.height,
        });

        const currData = imageData.data;

        if (!prevFrameRef.current) {
          prevFrameRef.current = new Uint8ClampedArray(currData);
          if (captureStore.ocrEnabled) {
            runOCR(imageData).then((text) => {
              if (text) {
                prevOcrTextRef.current = text;
                // Check start trigger on initial OCR
                const { triggers } = useCaptureStore.getState();
                const currentState = useTimerStore.getState().state;
                if (textMatches(text, triggers.startTriggers) && (currentState === 'idle' || currentState === 'paused')) {
                  timerStart();
                }
              }
            });
          }
          return;
        }

        const result = await comparisonRef.current.compare(
          prevFrameRef.current,
          currData,
          threshold
        );

        captureStore.setLastDiff(result.avgDiff);

        ocrCounterRef.current++;
        const shouldRunOCR = captureStore.ocrEnabled && (
          result.changeDetected || ocrCounterRef.current % 4 === 0
        );

        if (result.changeDetected) {
          const now = performance.now();
          if (now - lastChangeTimeRef.current > debounceDelay) {
            lastChangeTimeRef.current = now;

            if (captureStore.ocrEnabled) {
              // OCR-based detection: run OCR then handle with role-based triggers
              runOCR(imageData).then((newText) => {
                if (newText) {
                  handleOcrResult(newText, result.avgDiff);
                }
              });
            } else {
              // No OCR: record lap on pixel change if timer running
              const currentState = useTimerStore.getState().state;
              if (currentState === 'running') {
                addLap('auto', undefined, result.avgDiff);
              }
            }
          }
        } else if (shouldRunOCR) {
          // Periodic OCR even without pixel change
          runOCR(imageData).then((text) => {
            if (text && normalizeOcrText(text) !== normalizeOcrText(prevOcrTextRef.current)) {
              handleOcrResult(text, result.avgDiff);
            }
          });
        }

        prevFrameRef.current = new Uint8ClampedArray(currData);
      } catch {
        // frame capture can fail if stream ended
      }
    }, detectionInterval);
  }, [captureStore, sensitivity, detectionInterval, debounceDelay, addLap, getElapsed, runOCR, handleOcrResult, timerStart]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    comparisonRef.current?.terminate();
    comparisonRef.current = null;
    prevFrameRef.current = null;
    captureStore.setDetecting(false);
    captureStore.setLastDiff(0);
  }, [captureStore]);

  // Auto-start detection when capturing with ROI set
  useEffect(() => {
    if (autoDetect && captureStore.isCapturing && captureStore.roi && !captureStore.isDetecting) {
      // Auto-start detection even without timer running (triggers will start timer)
      startDetection();
    }
  }, [autoDetect, captureStore.isCapturing, captureStore.roi, captureStore.isDetecting, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      comparisonRef.current?.terminate();
      ocrService.terminate();
    };
  }, []);

  return {
    isDetecting: captureStore.isDetecting,
    lastDiff: captureStore.lastDiff,
    ocrText: captureStore.ocrText,
    ocrLoading: captureStore.ocrLoading,
    ocrEnabled: captureStore.ocrEnabled,
    setOcrEnabled: captureStore.setOcrEnabled,
    startDetection,
    stopDetection,
  };
}
