import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimerControls } from './TimerControls';

describe('TimerControls', () => {
  const defaultProps = {
    timerState: 'idle' as const,
    onStart: vi.fn(),
    onStop: vi.fn(),
    onReset: vi.fn(),
    onLap: vi.fn(),
  };

  it('shows start button when idle', () => {
    render(<TimerControls {...defaultProps} />);
    expect(screen.getByText('시작')).toBeInTheDocument();
    expect(screen.queryByText('정지')).not.toBeInTheDocument();
  });

  it('shows stop button when running', () => {
    render(<TimerControls {...defaultProps} timerState="running" />);
    expect(screen.getByText('정지')).toBeInTheDocument();
    expect(screen.queryByText('시작')).not.toBeInTheDocument();
  });

  it('disables reset when idle', () => {
    render(<TimerControls {...defaultProps} />);
    expect(screen.getByText('초기화')).toBeDisabled();
  });

  it('enables reset when running', () => {
    render(<TimerControls {...defaultProps} timerState="running" />);
    expect(screen.getByText('초기화')).not.toBeDisabled();
  });

  it('disables lap when not running', () => {
    render(<TimerControls {...defaultProps} />);
    expect(screen.getByText('구간')).toBeDisabled();
  });

  it('enables lap when running', () => {
    render(<TimerControls {...defaultProps} timerState="running" />);
    expect(screen.getByText('구간')).not.toBeDisabled();
  });

  it('calls onStart when start is clicked', () => {
    render(<TimerControls {...defaultProps} />);
    fireEvent.click(screen.getByText('시작'));
    expect(defaultProps.onStart).toHaveBeenCalledOnce();
  });

  it('calls onStop when stop is clicked', () => {
    const onStop = vi.fn();
    render(<TimerControls {...defaultProps} timerState="running" onStop={onStop} />);
    fireEvent.click(screen.getByText('정지'));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('calls onLap when lap is clicked', () => {
    const onLap = vi.fn();
    render(<TimerControls {...defaultProps} timerState="running" onLap={onLap} />);
    fireEvent.click(screen.getByText('구간'));
    expect(onLap).toHaveBeenCalledOnce();
  });
});
