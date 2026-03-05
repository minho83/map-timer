import { useEffect } from 'react';
import type { ROIRect } from '../../types';

interface ScreenPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCapturing: boolean;
  roi: ROIRect | null;
  streamDimensions: { width: number; height: number } | null;
}

export function ScreenPreview({ videoRef, isCapturing, roi, streamDimensions }: ScreenPreviewProps) {
  useEffect(() => {
    // Force video to maintain aspect ratio
  }, [streamDimensions]);

  if (!isCapturing) {
    return (
      <div className="w-full aspect-video bg-bg-tertiary rounded-lg flex items-center justify-center text-text-muted text-sm border border-border border-dashed">
        화면 공유를 시작하세요
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full block"
      />
      {roi && streamDimensions && (
        <div
          className="absolute border-2 border-accent rounded pointer-events-none"
          style={{
            left: `${roi.xNorm * 100}%`,
            top: `${roi.yNorm * 100}%`,
            width: `${roi.widthNorm * 100}%`,
            height: `${roi.heightNorm * 100}%`,
          }}
        >
          <div className="absolute -top-5 left-0 text-[10px] bg-accent text-white px-1 rounded">
            ROI
          </div>
        </div>
      )}
    </div>
  );
}
