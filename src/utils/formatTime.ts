import type { DisplayFormat } from '../types';

export function formatTime(ms: number, format: DisplayFormat = 'HH:MM:SS.ss'): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  switch (format) {
    case 'HH:MM:SS':
      return `${hh}:${mm}:${ss}`;
    case 'HH:MM:SS.s':
      return `${hh}:${mm}:${ss}.${Math.floor((ms % 1000) / 100)}`;
    case 'HH:MM:SS.ss':
      return `${hh}:${mm}:${ss}.${String(Math.floor((ms % 1000) / 10)).padStart(2, '0')}`;
  }
}

export function formatSplitTime(ms: number): string {
  const rounded = Math.round(ms);
  if (rounded < 1000) return `${rounded}ms`;
  if (rounded < 60000) return `${(rounded / 1000).toFixed(1)}초`;
  const min = Math.floor(rounded / 60000);
  const sec = Math.floor((rounded % 60000) / 1000);
  return `${min}분 ${sec}초`;
}

export function parseTimeInput(value: string): number {
  const parts = value.split(':').map(Number);
  if (parts.length === 3) {
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  if (parts.length === 2) {
    return (parts[0] * 60 + parts[1]) * 1000;
  }
  return parts[0] * 1000;
}
