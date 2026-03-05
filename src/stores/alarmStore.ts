import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Alarm } from '../types';

interface AlarmStore {
  alarms: Alarm[];
  activeAlarmId: string | null;

  addAlarm: (alarm: Omit<Alarm, 'id' | 'triggered'>) => void;
  removeAlarm: (id: string) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  triggerAlarm: (id: string) => void;
  dismissAlarm: () => void;
  /** 새 구간 시작 시 모든 알람의 triggered를 리셋 (다음 구간에서 다시 울릴 수 있도록) */
  resetAllTriggers: () => void;
}

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set) => ({
      alarms: [],
      activeAlarmId: null,

      addAlarm: (alarm) =>
        set((s) => ({
          alarms: [
            ...s.alarms,
            { ...alarm, id: crypto.randomUUID(), triggered: false },
          ],
        })),

      removeAlarm: (id) =>
        set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) })),

      updateAlarm: (id, updates) =>
        set((s) => ({
          alarms: s.alarms.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      triggerAlarm: (id) =>
        set((s) => ({
          activeAlarmId: id,
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, triggered: true } : a
          ),
        })),

      dismissAlarm: () => set({ activeAlarmId: null }),

      resetAllTriggers: () =>
        set((s) => ({
          alarms: s.alarms.map((a) => ({ ...a, triggered: false })),
          activeAlarmId: null,
        })),
    }),
    { name: 'map-timer-alarms' }
  )
);
