// --- ROI ---
export interface ROIRect {
  x: number;
  y: number;
  width: number;
  height: number;
  xNorm: number;
  yNorm: number;
  widthNorm: number;
  heightNorm: number;
}

// --- Timer ---
export interface Lap {
  id: number;
  timestamp: number;
  splitTime: number;
  type: 'auto' | 'manual';
  label?: string;
  detectedDiff?: number;
}

export type TimerState = 'idle' | 'running' | 'paused';

// --- Alarm ---
export interface Alarm {
  id: string;
  name: string;
  /** 구간 시간 초과 기준 (ms) - 현재 구간이 이 시간을 넘으면 알람 */
  targetTime: number;
  soundFile: string;
  visual: {
    flash: boolean;
    colorChange: boolean;
    overlay: boolean;
  };
  enabled: boolean;
  /** 현재 구간에서 이미 트리거 되었는지 (새 구간 시작 시 리셋) */
  triggered: boolean;
}

// --- Settings ---
export type DisplayFormat = 'HH:MM:SS' | 'HH:MM:SS.s' | 'HH:MM:SS.ss';
export type ViewMode = 'compact' | 'full';

export interface AppSettings {
  displayFormat: DisplayFormat;
  viewMode: ViewMode;
  alarmVolume: number;
  selectedAlarmSound: string;
  autoDetect: boolean;
  sensitivity: number;
  detectionInterval: number;
  debounceDelay: number;
  compactOpacity: number;
}

// --- Worker Messages ---
export interface CompareRequest {
  prevData: Uint8ClampedArray;
  currData: Uint8ClampedArray;
  threshold: number;
}

export interface CompareResult {
  avgDiff: number;
  changeDetected: boolean;
}
