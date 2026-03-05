import type { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  displayFormat: 'HH:MM:SS.ss',
  viewMode: 'full',
  alarmVolume: 70,
  selectedAlarmSound: 'alarm-default',
  autoDetect: true,
  sensitivity: 30,
  detectionInterval: 500,
  debounceDelay: 2000,
  compactOpacity: 0.85,
};

export const SOUND_FILES = [
  { id: 'alarm-default', label: '기본 알람' },
  { id: 'alarm-bell', label: '종소리' },
  { id: 'alarm-chime', label: '차임벨' },
  { id: 'alarm-urgent', label: '긴급 알람' },
] as const;

export const ALARM_PRESETS = [
  { label: '5분', ms: 5 * 60 * 1000 },
  { label: '10분', ms: 10 * 60 * 1000 },
  { label: '15분', ms: 15 * 60 * 1000 },
  { label: '30분', ms: 30 * 60 * 1000 },
  { label: '1시간', ms: 60 * 60 * 1000 },
] as const;

export const sensitivityToThreshold = (sensitivity: number): number => {
  return 5 + (sensitivity / 100) * 75;
};
