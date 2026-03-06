import { createWorker, type Worker } from 'tesseract.js';

class OCRService {
  private worker: Worker | null = null;
  private initializing = false;
  private ready = false;

  async init(): Promise<void> {
    if (this.ready || this.initializing) return;
    this.initializing = true;

    try {
      this.worker = await createWorker('kor+eng', undefined, {
        logger: () => {},
      });
      this.ready = true;
    } catch (err) {
      console.warn('OCR initialization failed:', err);
      this.ready = false;
    } finally {
      this.initializing = false;
    }
  }

  async recognize(imageData: ImageData): Promise<string> {
    if (!this.worker || !this.ready) {
      await this.init();
    }
    if (!this.worker) return '';

    try {
      // Convert ImageData to canvas data URL
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);

      const { data } = await this.worker.recognize(canvas);
      return data.text.trim();
    } catch (err) {
      console.warn('OCR recognition failed:', err);
      return '';
    }
  }

  async recognizeFromCanvas(canvas: HTMLCanvasElement): Promise<string> {
    if (!this.worker || !this.ready) {
      await this.init();
    }
    if (!this.worker) return '';

    try {
      const { data } = await this.worker.recognize(canvas);
      return data.text.trim();
    } catch (err) {
      console.warn('OCR recognition failed:', err);
      return '';
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.ready = false;
    }
  }

  get isReady(): boolean {
    return this.ready;
  }

  get isInitializing(): boolean {
    return this.initializing;
  }
}

export const ocrService = new OCRService();
