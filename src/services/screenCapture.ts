export class ScreenCaptureService {
  private stream: MediaStream | null = null;
  private videoEl: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    this.videoEl = document.createElement('video');
    this.videoEl.playsInline = true;
    this.videoEl.muted = true;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  async startCapture(): Promise<MediaStream> {
    this.stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    this.videoEl.srcObject = this.stream;
    await this.videoEl.play();

    const track = this.stream.getVideoTracks()[0];
    const settings = track.getSettings();
    this.canvas.width = settings.width || 1280;
    this.canvas.height = settings.height || 720;

    track.addEventListener('ended', () => {
      this.stopCapture();
      this.onEndedCallback?.();
    });

    return this.stream;
  }

  stopCapture(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.videoEl.srcObject = null;
  }

  onEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }

  get isCapturing(): boolean {
    return this.stream !== null && this.stream.active;
  }

  get video(): HTMLVideoElement {
    return this.videoEl;
  }

  get dimensions(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  captureROI(roi: { x: number; y: number; width: number; height: number }): ImageData {
    this.ctx.drawImage(this.videoEl, 0, 0, this.canvas.width, this.canvas.height);
    return this.ctx.getImageData(roi.x, roi.y, roi.width, roi.height);
  }

  getSnapshot(): string {
    this.ctx.drawImage(this.videoEl, 0, 0, this.canvas.width, this.canvas.height);
    return this.canvas.toDataURL('image/png');
  }
}

export const screenCaptureService = new ScreenCaptureService();
