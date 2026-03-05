import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';

describe('TimerDisplay', () => {
  it('renders formatted time', () => {
    render(<TimerDisplay displayTime={65230} />);
    expect(screen.getByText('00:01:05.23')).toBeInTheDocument();
  });

  it('renders zero time', () => {
    render(<TimerDisplay displayTime={0} />);
    expect(screen.getByText('00:00:00.00')).toBeInTheDocument();
  });

  it('renders in compact mode with smaller text', () => {
    const { container } = render(<TimerDisplay displayTime={1000} compact />);
    expect(container.querySelector('.text-2xl')).toBeInTheDocument();
  });

  it('renders in full mode with larger text', () => {
    const { container } = render(<TimerDisplay displayTime={1000} />);
    expect(container.querySelector('.text-3xl')).toBeInTheDocument();
  });
});
