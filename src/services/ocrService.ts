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

  /** Target width range for OCR input */
  private static readonly TARGET_OCR_WIDTH = 600;
  private static readonly MIN_OCR_WIDTH = 200;
  private static readonly MAX_OCR_WIDTH = 800;

  /**
   * Preprocess image for better OCR:
   * 1. Scale to optimal size (too big = slow/fail, too small = unreadable)
   * 2. Grayscale + contrast enhancement (game text is bright on dark bg)
   */
  private preprocessForOCR(imageData: ImageData): HTMLCanvasElement {
    const tmp = document.createElement('canvas');
    tmp.width = imageData.width;
    tmp.height = imageData.height;
    tmp.getContext('2d')!.putImageData(imageData, 0, 0);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Scale to optimal range
    let scale = 1;
    if (imageData.width > OCRService.MAX_OCR_WIDTH) {
      scale = OCRService.TARGET_OCR_WIDTH / imageData.width;
    } else if (imageData.width < OCRService.MIN_OCR_WIDTH) {
      scale = OCRService.TARGET_OCR_WIDTH / imageData.width;
    }

    canvas.width = Math.round(imageData.width * scale);
    canvas.height = Math.round(imageData.height * scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);

    // Grayscale + contrast enhancement
    const scaled = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = scaled.data;
    for (let i = 0; i < px.length; i += 4) {
      const gray = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
      // Push darks darker, lights lighter for clearer text edges
      const enhanced = gray > 128
        ? Math.min(255, gray * 1.3)
        : Math.max(0, gray * 0.7);
      px[i] = px[i + 1] = px[i + 2] = enhanced;
    }
    ctx.putImageData(scaled, 0, 0);

    return canvas;
  }

  async recognize(imageData: ImageData): Promise<string> {
    if (!this.worker || !this.ready) {
      await this.init();
    }
    if (!this.worker) return '';

    try {
      const canvas = this.preprocessForOCR(imageData);
      console.log(`[OCR] Processing ${imageData.width}x${imageData.height} → ${canvas.width}x${canvas.height}`);
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
