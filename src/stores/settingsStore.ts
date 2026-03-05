import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface SettingsStore extends AppSettings {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  toggleViewMode: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSetting: (key, value) => set({ [key]: value }),
      resetSettings: () => set(DEFAULT_SETTINGS),
      toggleViewMode: () =>
        set((s) => ({
          viewMode: s.viewMode === 'compact' ? 'full' : 'compact',
        })),
    }),
    { name: 'map-timer-settings' }
  )
);
