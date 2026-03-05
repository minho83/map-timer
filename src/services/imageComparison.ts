import type { CompareResult } from '../types';

export class ImageComparisonService {
  private worker: Worker;
  private pendingResolve: ((result: CompareResult) => void) | null = null;

  constructor() {
    this.worker = new Worker(
      new URL('../workers/imageCompare.worker.ts', import.meta.url),
      { type: 'module' }
    );
    this.worker.onmessage = (e: MessageEvent<CompareResult>) => {
      this.pendingResolve?.(e.data);
      this.pendingResolve = null;
    };
  }

  compare(
    prevData: Uint8ClampedArray,
    currData: Uint8ClampedArray,
    threshold: number
  ): Promise<CompareResult> {
    return new Promise((resolve) => {
      this.pendingResolve = resolve;
      this.worker.postMessage({ prevData, currData, threshold });
    });
  }

  terminate(): void {
    this.worker.terminate();
  }
}
