import { describe, it, expect } from 'vitest';
import { formatTime, formatSplitTime, parseTimeInput } from './formatTime';

describe('formatTime', () => {
  it('formats 0ms correctly', () => {
    expect(formatTime(0, 'HH:MM:SS')).toBe('00:00:00');
    expect(formatTime(0, 'HH:MM:SS.s')).toBe('00:00:00.0');
    expect(formatTime(0, 'HH:MM:SS.ss')).toBe('00:00:00.00');
  });

  it('formats seconds correctly', () => {
    expect(formatTime(5000, 'HH:MM:SS')).toBe('00:00:05');
    expect(formatTime(65000, 'HH:MM:SS')).toBe('00:01:05');
  });

  it('formats hours correctly', () => {
    expect(formatTime(3661000, 'HH:MM:SS')).toBe('01:01:01');
  });

  it('formats with deciseconds', () => {
    expect(formatTime(1500, 'HH:MM:SS.s')).toBe('00:00:01.5');
    expect(formatTime(1234, 'HH:MM:SS.s')).toBe('00:00:01.2');
  });

  it('formats with centiseconds', () => {
    expect(formatTime(1230, 'HH:MM:SS.ss')).toBe('00:00:01.23');
    expect(formatTime(1005, 'HH:MM:SS.ss')).toBe('00:00:01.00');
  });

  it('handles large values', () => {
    const ms = 99 * 3600000 + 59 * 60000 + 59 * 1000;
    expect(formatTime(ms, 'HH:MM:SS')).toBe('99:59:59');
  });
});

describe('formatSplitTime', () => {
  it('formats milliseconds', () => {
    expect(formatSplitTime(500)).toBe('500ms');
  });

  it('formats seconds', () => {
    expect(formatSplitTime(5000)).toBe('5.0초');
    expect(formatSplitTime(15500)).toBe('15.5초');
  });

  it('formats minutes and seconds', () => {
    expect(formatSplitTime(65000)).toBe('1분 5초');
    expect(formatSplitTime(125000)).toBe('2분 5초');
  });
});

describe('parseTimeInput', () => {
  it('parses HH:MM:SS format', () => {
    expect(parseTimeInput('1:30:00')).toBe(5400000);
    expect(parseTimeInput('0:5:30')).toBe(330000);
  });

  it('parses MM:SS format', () => {
    expect(parseTimeInput('5:30')).toBe(330000);
  });

  it('parses seconds only', () => {
    expect(parseTimeInput('30')).toBe(30000);
  });
});
