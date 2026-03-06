import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ROIRect } from '../types';

/** 역할별 트리거 텍스트 설정 */
export interface TriggerConfig {
  /** 타이머 시작 트리거 텍스트 목록 */
  startTriggers: string[];
  /** 타이머 종료 트리거 텍스트 목록 */
  stopTriggers: string[];
  /** 경고 알람 트리거 텍스트 목록 */
  warningTriggers: string[];
}

/** 트리거 프리셋 (ROI 좌표 포함 가능) */
export interface TriggerPreset {
  name: string;
  config: TriggerConfig;
  roi?: ROIRect | null;
}

const DEFAULT_TRIGGER_CONFIG: TriggerConfig = {
  startTriggers: ['혼돈의탑5-1'],
  stopTriggers: ['보상룸'],
  warningTriggers: [],
};

interface CaptureStore {
  isCapturing: boolean;
  isDetecting: boolean;
  roi: ROIRect | null;
  streamDimensions: { width: number; height: number } | null;
  lastDiff: number;
  isSelectingROI: boolean;
  ocrText: string;
  ocrLoading: boolean;
  ocrEnabled: boolean;
  /** 역할별 트리거 텍스트 설정 */
  triggers: TriggerConfig;
  /** 저장된 프리셋 목록 */
  presets: TriggerPreset[];

  setCapturing: (value: boolean) => void;
  setDetecting: (value: boolean) => void;
  setROI: (roi: ROIRect | null) => void;
  setStreamDimensions: (dims: { width: number; height: number } | null) => void;
  setLastDiff: (diff: number) => void;
  setSelectingROI: (value: boolean) => void;
  setOcrText: (text: string) => void;
  setOcrLoading: (value: boolean) => void;
  setOcrEnabled: (value: boolean) => void;

  // 트리거 관리
  addTrigger: (role: keyof TriggerConfig, text: string) => void;
  removeTrigger: (role: keyof TriggerConfig, text: string) => void;
  setTriggers: (config: TriggerConfig) => void;

  // 프리셋 관리
  addPreset: (preset: TriggerPreset) => void;
  removePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  importPresets: (json: string) => boolean;
  exportPresets: () => string;

  clearCapture: () => void;
}

export const useCaptureStore = create<CaptureStore>()(
  persist(
    (set, get) => ({
      isCapturing: false,
      isDetecting: false,
      roi: null,
      streamDimensions: null,
      lastDiff: 0,
      isSelectingROI: false,
      ocrText: '',
      ocrLoading: false,
      ocrEnabled: true,
      triggers: { ...DEFAULT_TRIGGER_CONFIG },
      presets: [],

      setCapturing: (value) => set({ isCapturing: value }),
      setDetecting: (value) => set({ isDetecting: value }),
      setROI: (roi) => set({ roi }),
      setStreamDimensions: (dims) => set({ streamDimensions: dims }),
      setLastDiff: (diff) => set({ lastDiff: diff }),
      setSelectingROI: (value) => set({ isSelectingROI: value }),
      setOcrText: (text) => set({ ocrText: text }),
      setOcrLoading: (value) => set({ ocrLoading: value }),
      setOcrEnabled: (value) => set({ ocrEnabled: value }),

      addTrigger: (role, text) =>
        set((s) => {
          const list = s.triggers[role];
          if (list.includes(text)) return s;
          return { triggers: { ...s.triggers, [role]: [...list, text] } };
        }),

      removeTrigger: (role, text) =>
        set((s) => ({
          triggers: { ...s.triggers, [role]: s.triggers[role].filter((t) => t !== text) },
        })),

      setTriggers: (config) => set({ triggers: config }),

      addPreset: (preset) =>
        set((s) => ({
          presets: [
            ...s.presets.filter((p) => p.name !== preset.name),
            { ...preset, roi: preset.roi !== undefined ? preset.roi : s.roi },
          ],
        })),

      removePreset: (name) =>
        set((s) => ({
          presets: s.presets.filter((p) => p.name !== name),
        })),

      loadPreset: (name) => {
        const preset = get().presets.find((p) => p.name === name);
        if (preset) {
          const updates: Partial<CaptureStore> = { triggers: { ...preset.config } };
          if (preset.roi) {
            updates.roi = preset.roi;
          }
          set(updates);
        }
      },

      importPresets: (json) => {
        try {
          const data = JSON.parse(json);
          if (Array.isArray(data)) {
            const valid = data.filter(
              (p): p is TriggerPreset =>
                p && typeof p.name === 'string' && p.config &&
                Array.isArray(p.config.startTriggers) &&
                Array.isArray(p.config.stopTriggers) &&
                Array.isArray(p.config.warningTriggers)
            );
            set((s) => {
              const existing = new Set(s.presets.map((p) => p.name));
              const merged = [...s.presets];
              for (const p of valid) {
                if (existing.has(p.name)) {
                  const idx = merged.findIndex((m) => m.name === p.name);
                  merged[idx] = p;
                } else {
                  merged.push(p);
                }
              }
              return { presets: merged };
            });
            return true;
          }
          // Single config (not array) → load directly as triggers
          if (data.startTriggers && data.stopTriggers && data.warningTriggers) {
            set({ triggers: data });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      exportPresets: () => {
        const { presets, triggers, roi } = get();
        return JSON.stringify(
          { currentConfig: triggers, roi, presets },
          null,
          2
        );
      },

      clearCapture: () =>
        set({
          isCapturing: false,
          isDetecting: false,
          streamDimensions: null,
          lastDiff: 0,
          ocrText: '',
        }),
    }),
    {
      name: 'map-timer-capture',
      version: 1,
      partialize: (state) => ({
        ocrEnabled: state.ocrEnabled,
        triggers: state.triggers,
        presets: state.presets,
        roi: state.roi,
      }),
      migrate: (persisted: unknown, version: number) => {
        if (version === 0) {
          // v0 → v1: 빈 트리거에 기본값 적용
          const state = persisted as { triggers?: TriggerConfig };
          if (state.triggers) {
            if (state.triggers.startTriggers.length === 0) {
              state.triggers.startTriggers = DEFAULT_TRIGGER_CONFIG.startTriggers;
            }
            if (state.triggers.stopTriggers.length === 0) {
              state.triggers.stopTriggers = DEFAULT_TRIGGER_CONFIG.stopTriggers;
            }
          }
        }
        return persisted as Record<string, unknown>;
      },
    }
  )
);
