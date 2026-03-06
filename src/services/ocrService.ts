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
        logger: (msg) => {
          if (msg.status === 'recognizing text') return;
          console.log('[OCR]', msg.status, msg.progress);
        },
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v7.0.0/dist/worker.min.js',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v7.0.0',
        langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js-ocr-languages@latest/tessdata',
        workerBlobURL: true,
      });
      this.ready = true;
      console.log('[OCR] Initialization complete');
    } catch (err) {
      console.error('[OCR] Initialization failed:', err);
      this.ready = false;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Max width for OCR input. High-res captures (4K+) produce ROI images
   * too large for Tesseract to process reliably. Scale down to this width.
   */
  private static readonly MAX_OCR_WIDTH = 800;

  async recognize(imageData: ImageData): Promise<string> {
    if (!this.worker || !this.ready) {
      await this.init();
    }
    if (!this.worker) return '';

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Scale down large ROI images for reliable OCR
      if (imageData.width > OCRService.MAX_OCR_WIDTH) {
        const scale = OCRService.MAX_OCR_WIDTH / imageData.width;
        canvas.width = Math.round(imageData.width * scale);
        canvas.height = Math.round(imageData.height * scale);

        // Draw original to temp canvas, then scale down
        const tmp = document.createElement('canvas');
        tmp.width = imageData.width;
        tmp.height = imageData.height;
        tmp.getContext('2d')!.putImageData(imageData, 0, 0);

        ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
      } else {
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
      }

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
