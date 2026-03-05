import { useCallback, useRef, useEffect } from 'react';
import { screenCaptureService } from '../services/screenCapture';
import { useCaptureStore } from '../stores/captureStore';

export function useScreenCapture() {
  const store = useCaptureStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    screenCaptureService.onEnded(() => {
      store.clearCapture();
    });
  }, [store]);

  const startCapture = useCallback(async () => {
    try {
      const stream = await screenCaptureService.startCapture();
      const dims = screenCaptureService.dimensions;
      store.setCapturing(true);
      store.setStreamDimensions(dims);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Screen capture cancelled or failed:', err);
    }
  }, [store]);

  const stopCapture = useCallback(() => {
    screenCaptureService.stopCapture();
    store.clearCapture();
    store.setROI(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [store]);

  const getSnapshot = useCallback(() => {
    if (!screenCaptureService.isCapturing) return null;
    return screenCaptureService.getSnapshot();
  }, []);

  return {
    videoRef,
    isCapturing: store.isCapturing,
    streamDimensions: store.streamDimensions,
    startCapture,
    stopCapture,
    getSnapshot,
    service: screenCaptureService,
  };
}
